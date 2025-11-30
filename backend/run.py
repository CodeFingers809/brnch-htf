import os
from dotenv import load_dotenv

load_dotenv()
from app import create_app

app = create_app()

if __name__ == "__main__":
    # Debug mode is on for development. Turn off in production.
    debug_mode = os.getenv("DEBUG_MODE", "true").lower() in ("true", "1", "yes")
    app.run(
        debug=debug_mode,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5001)),
    )
