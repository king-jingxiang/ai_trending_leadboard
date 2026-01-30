from google import genai
from google.genai import types
from .config import Config
import json

class LLMClient:
    def __init__(self):
        self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
        self.model_name = "gemini-3-flash-preview" # Using a reliable recent model, or gemini-1.5-flash

    def generate_tags(self, repo_data):
        """
        Generates tags for a repository based on its description and readme.
        """
        if not Config.GEMINI_API_KEY:
            print("Warning: GEMINI_API_KEY not set. Skipping tagging.")
            return []

        description = repo_data.get('description', '')
        readme = repo_data.get('readme', '')[:2000] # Truncate readme to save tokens
        
        prompt = f"""
        Analyze the following GitHub repository and assign relevant categories/tags to it.
        
        Repo: {repo_data.get('full_name')}
        Description: {description}
        Readme Snippet: {readme}
        
        The available categories are:
        - Infrastructure & Training: Foundation Model, Inference & Serving, Fine-tuning & Training, Quantization
        - App Development: Agent Framework, Workflow Orchestration, RAG, Vector Database
        - Verticals & Tools: Coding Assistant, Chatbot, Image & Video Generation, Audio & Speech
        - Ops & Eval: LLMOps & Evaluation, Security & Safety
        - Others: Data & Datasets, Non-AI
        
        Please return a JSON object with a single key "tags" containing a list of strings.
        Example: {{"tags": ["Agent Framework", "RAG"]}}
        Only return the JSON.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            result = json.loads(response.text)
            return result.get("tags", [])
        except Exception as e:
            print(f"Error generating tags: {e}")
            return []
