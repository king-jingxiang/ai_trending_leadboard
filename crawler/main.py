import datetime
import json
import os
import time
from .config import Config
from .storage import Storage
from .github_client import GitHubClient
from .llm import LLMClient

def main():
    print("Starting AI Trending Crawler...")
    
    storage = Storage()
    gh_client = GitHubClient()
    llm_client = LLMClient()
    
    today_str = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # 1. Get Trending Data
    trending_repos = gh_client.get_trending(time_range='daily')
    print(f"Found {len(trending_repos)} trending repos today.")
    
    processed_repos = []
    
    for repo_summary in trending_repos:
        owner = repo_summary['owner']
        repo_name = repo_summary['repo']
        file_key = f"data/projects/{owner}/{repo_name}.json"
        
        print(f"Processing {owner}/{repo_name}...")
        
        # 2. Check if exists in Storage
        existing_data = storage.get_json(file_key)
        
        if existing_data:
            print("  - Found existing data. Updating...")
            repo_data = existing_data
            
            # Update Star History (Append today's growth if possible)
            # If we trust the trending data 'stars' count:
            current_stars = repo_summary['stars']
            
            # Check if today is already recorded
            history = repo_data.get('star_history', [])
            if not history or history[-1]['date'] != today_str:
                history.append({
                    "date": today_str,
                    "count": current_stars
                })
                repo_data['star_history'] = history
                
            # Update basic info
            repo_data['stargazers_count'] = current_stars
            repo_data['forks_count'] = repo_summary['forks']
            repo_data['updated_at'] = datetime.datetime.now().isoformat()
            
        else:
            print("  - New project. Fetching full details...")
            # Fetch details from GitHub API
            details = gh_client.get_repo_details(owner, repo_name)
            if not details:
                print("  - Failed to get details. Skipping.")
                continue
                
            # Generate Tags
            print("  - Generating tags...")
            tags = llm_client.generate_tags(details)
            details['tags'] = tags
            
            # Get Star History (Initial)
            print("  - Fetching star history...")
            history = gh_client.get_star_history(owner, repo_name)
            details['star_history'] = history
            
            repo_data = details
        
        # 3. Save Project Data
        storage.upload_json(file_key, repo_data)
        
        # Add to list for daily summary
        processed_repos.append({
            "owner": owner,
            "repo": repo_name,
            "description": repo_data.get('description'),
            "language": repo_data.get('language'),
            "stars": repo_data.get('stargazers_count'),
            "forks": repo_data.get('forks_count'),
            "growth": repo_summary.get('growth'),
            "tags": repo_data.get('tags', [])
        })
        
        # Sleep briefly to avoid rate limits if doing heavy API calls
        time.sleep(1)

    # 4. Save Daily Trending
    daily_key = f"data/daily/{today_str}.json"
    storage.upload_json(daily_key, processed_repos)
    
    # 5. Update Index (All Projects Summary)
    # Ideally, we should read the existing index and merge.
    # But listing all files in S3 is expensive if there are many.
    # For now, let's just assume we might want to rebuild it or maintain it incrementally.
    # A simple approach for this MVP:
    # Read index.json, update entries for processed_repos, write back.
    
    index_key = "data/index.json"
    index_data = storage.get_json(index_key) or []
    
    # Create a map for faster lookup
    index_map = {f"{item['owner']}/{item['repo']}": item for item in index_data}
    
    for repo in processed_repos:
        full_name = f"{repo['owner']}/{repo['repo']}"
        index_map[full_name] = {
            "owner": repo['owner'],
            "repo": repo['repo'],
            "description": repo['description'],
            "stars": repo['stars'],
            "tags": repo['tags'],
            "language": repo['language'],
            "last_seen": today_str
        }
        
    new_index_data = list(index_map.values())
    storage.upload_json(index_key, new_index_data)
    
    print("Done!")

if __name__ == "__main__":
    main()
