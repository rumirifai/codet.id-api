from fastapi import FastAPI, UploadFile, File, HTTPException
from google.cloud import storage
import os
from io import BytesIO
from tensorflow.keras.utils import load_img, img_to_array  # type: ignore
import numpy as np
import tensorflow as tf
import requests
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Configuration for Google Cloud
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# Initialize FastAPI
app = FastAPI()

# Download model from bucket
def download_model(model_url: str, local_path: str):
    if not os.path.exists(local_path):
        print(f"Downloading model from {model_url} to {local_path}...")
        response = requests.get(model_url, stream=True)
        if response.status_code == 200:
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    f.write(chunk)
        else:
            raise ValueError(f"Failed to download model. Status code: {response.status_code}")
    else:
        print(f"Model already exists at {local_path}")

# Load pre-trained model
def load_model():
    model_url = "https://storage.googleapis.com/codet/cnn_model_kelapa.h5"
    local_model_path = "models/cnn_model_kelapa.h5"

    # Ensure the models directory exists
    os.makedirs(os.path.dirname(local_model_path), exist_ok=True)
    
    # Download the model if not present locally
    download_model(model_url, local_model_path)
    
    # Load the model from the local path
    return tf.keras.models.load_model(local_model_path)

# Predict image with model
def predict(image_data):
    model = load_model()
    prediction = model.predict(image_data)
    class_idx = tf.argmax(prediction, axis=1).numpy()[0]
    return int(class_idx)  # Assuming classes are indexed as integers

# Image preprocessing function
def preprocess_image(file: UploadFile, target_size=(224, 224)):
    # Read file content into memory
    content = BytesIO(file.file.read())
    image = load_img(content, target_size=target_size)
    image_array = img_to_array(image)
    image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
    image_array = image_array / 255.0  # Normalize to [0,1]
    return image_array

# Upload image to storage
def upload_to_gcs(file: UploadFile, bucket_name: str) -> str:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file.filename)
    # Reset file pointer before uploading
    file.file.seek(0)
    blob.upload_from_file(file.file, content_type=file.content_type)
    return blob.public_url

# FastAPI routes
@app.post("/predict")
async def get_prediction(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    if not file.filename.lower().endswith(("png", "jpg", "jpeg")):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Preprocess image and predict
        image_data = preprocess_image(file)
        result = predict(image_data)
        
        # Upload file to Google Cloud Storage
        public_url = upload_to_gcs(file, GCS_BUCKET_NAME)
        
        return {"prediction": result, "file_url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
