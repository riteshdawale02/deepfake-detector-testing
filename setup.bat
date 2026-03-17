@echo off
py -3.11 -m venv venv
call venv\Scripts\activate
pip install fastapi uvicorn python-multipart numpy pillow boto3 requests python-dotenv aiofiles opencv-python httpx pandas tqdm
pause
