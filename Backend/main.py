from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np

from PIL import Image

import io
from pathlib import Path


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="MNIST CNN API",
    description="MNIST Handwritten Digit Classification using CNN",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "mnist_cnn_model.keras"


# ============================================================
# CHECK MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"CNN model not found at: {MODEL_PATH}"
    )


# ============================================================
# LOAD MODEL
# ============================================================

try:

    model = tf.keras.models.load_model(
        MODEL_PATH
    )

    print()
    print("=" * 55)
    print("MNIST CNN MODEL LOADED SUCCESSFULLY")
    print("=" * 55)
    print(f"Model: {MODEL_PATH}")
    print("=" * 55)
    print()

except Exception as e:

    raise RuntimeError(
        f"Failed to load CNN model: {str(e)}"
    )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "MNIST CNN API is running",
        "status": "online",
        "model": "MNIST CNN",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model": "MNIST CNN",
        "model_loaded": True
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/info")
def info():

    return {
        "application": "MNIST CNN API",
        "framework": "FastAPI",
        "deep_learning": "TensorFlow",
        "model": "Convolutional Neural Network",
        "dataset": "MNIST",
        "image_size": "28x28",
        "channels": 1,
        "classes": 10,
        "digits": list(range(10))
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    try:

        # ----------------------------------------------------
        # Validate filename
        # ----------------------------------------------------

        if not file.filename:

            raise HTTPException(
                status_code=400,
                detail="No file uploaded."
            )


        # ----------------------------------------------------
        # Read uploaded image
        # ----------------------------------------------------

        image_bytes = await file.read()


        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )


        # ----------------------------------------------------
        # Open image
        # ----------------------------------------------------

        image = Image.open(
            io.BytesIO(image_bytes)
        )


        # ----------------------------------------------------
        # Convert to grayscale
        # ----------------------------------------------------

        image = image.convert("L")


        # ----------------------------------------------------
        # Resize to MNIST 28x28
        # ----------------------------------------------------

        image = image.resize(
            (28, 28)
        )


        # ----------------------------------------------------
        # Convert to NumPy
        # ----------------------------------------------------

        image_array = np.array(
            image
        )


        # ----------------------------------------------------
        # Normalize
        # 0-255 → 0-1
        # ----------------------------------------------------

        image_array = image_array.astype(
            "float32"
        ) / 255.0


        # ----------------------------------------------------
        # Reshape for CNN
        # ----------------------------------------------------

        image_array = image_array.reshape(
            1,
            28,
            28,
            1
        )


        # ----------------------------------------------------
        # Predict
        # ----------------------------------------------------

        prediction = model.predict(
            image_array,
            verbose=0
        )


        # ----------------------------------------------------
        # Predicted digit
        # ----------------------------------------------------

        digit = int(
            np.argmax(prediction)
        )


        # ----------------------------------------------------
        # Confidence
        # ----------------------------------------------------

        confidence = float(
            np.max(prediction)
        )


        # ----------------------------------------------------
        # All probabilities
        # ----------------------------------------------------

        probabilities = [
            float(value)
            for value in prediction[0]
        ]


        # ----------------------------------------------------
        # Return result
        # ----------------------------------------------------

        return {

            "success": True,

            "digit": digit,

            "confidence": confidence,

            "confidence_percentage": round(
                confidence * 100,
                2
            ),

            "probabilities": probabilities

        }


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Prediction failed: {str(e)}"
        )