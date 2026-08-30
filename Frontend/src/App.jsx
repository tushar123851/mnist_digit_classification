import { useRef, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setPrediction(null);
    setError("");
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setPrediction(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const predictImage = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);

    const formData = new FormData();

    formData.append("file", file);

    try {
      console.log(
        "Sending image to:",
        `${API_URL}/predict`
      );

      console.log(
        "File:",
        file.name,
        file.type,
        file.size
      );

      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(
        "Response status:",
        response.status
      );

      const responseText = await response.text();

      console.log(
        "Response:",
        responseText
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${responseText}`
        );
      }

      const data = JSON.parse(responseText);

      console.log(
        "Prediction:",
        data
      );

      setPrediction(data);

    } catch (err) {
      console.error(
        "CNN API ERROR:",
        err
      );

      setError(
        `Connection error: ${err.message}`
      );

    } finally {
      setLoading(false);
    }
  };

  const confidencePercentage = prediction
    ? (prediction.confidence * 100).toFixed(2)
    : null;

  return (
    <div className="app">

      <header className="navbar">

        <div className="brand">

          <div className="brand-icon">
            🧠
          </div>

          <div>
            <h2>MNIST Vision</h2>
            <span>CNN Image Classifier</span>
          </div>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          AI Model Online

        </div>

      </header>


      <main className="container">

        <section className="hero">

          <span className="badge">
            CONVOLUTIONAL NEURAL NETWORK
          </span>

          <h1>
            Recognize handwritten
            <span> digits with AI</span>
          </h1>

          <p>
            Upload a handwritten digit and let our CNN
            model identify the number with a confidence score.
          </p>

        </section>


        <section className="classifier">

          <div className="upload-card">

            <div className="section-heading">

              <div>

                <h3>Upload Image</h3>

                <p>
                  PNG, JPG or JPEG
                </p>

              </div>

            </div>


            {!preview ? (

              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <div className="upload-icon">
                  ↑
                </div>

                <h4>
                  Drop your digit image here
                </h4>

                <p>
                  or click to browse from your computer
                </p>

                <button
                  className="browse-button"
                  type="button"
                >
                  Choose Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  hidden
                />

              </div>

            ) : (

              <div className="preview-area">

                <div className="image-container">

                  <img
                    src={preview}
                    alt="Selected digit"
                  />

                </div>


                <div className="file-name">

                  <span>
                    Selected image
                  </span>

                  <strong>
                    {file?.name}
                  </strong>

                </div>


                <div className="action-buttons">

                  <button
                    className="predict-button"
                    onClick={predictImage}
                    disabled={loading}
                  >

                    {loading ? (

                      <>
                        <span className="spinner"></span>
                        Predicting...
                      </>

                    ) : (

                      <>✦ Predict Digit</>

                    )}

                  </button>


                  <button
                    className="remove-button"
                    onClick={removeImage}
                    disabled={loading}
                  >
                    Remove
                  </button>

                </div>

              </div>

            )}


            {error && (

              <div className="error-message">
                ⚠ {error}
              </div>

            )}

          </div>


          <div className="result-card">

            <div className="result-header">

              <div>

                <h3>
                  Prediction Result
                </h3>

                <p>
                  CNN model analysis
                </p>

              </div>

              <div className="model-badge">
                CNN
              </div>

            </div>


            {!prediction && !loading ? (

              <div className="empty-result">

                <div className="result-icon">
                  ?
                </div>

                <h4>
                  Waiting for prediction
                </h4>

                <p>
                  Upload an image and click
                  "Predict Digit" to see the CNN result.
                </p>

              </div>

            ) : loading ? (

              <div className="empty-result">

                <div className="large-spinner"></div>

                <h4>
                  Analyzing image...
                </h4>

                <p>
                  The CNN model is processing your image.
                </p>

              </div>

            ) : (

              <div className="prediction-result">

                <span className="result-label">
                  Predicted Digit
                </span>

                <div className="digit">
                  {prediction.digit}
                </div>


                <div className="confidence-title">

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {confidencePercentage}%
                  </strong>

                </div>


                <div className="progress">

                  <div
                    className="progress-bar"
                    style={{
                      width: `${confidencePercentage}%`,
                    }}
                  ></div>

                </div>


                <div className="result-message">

                  ✓ CNN prediction completed successfully

                </div>

              </div>

            )}

          </div>

        </section>


        <section className="info-section">

          <div className="info-card">

            <span>01</span>

            <h3>
              Upload
            </h3>

            <p>
              Select a handwritten digit image.
            </p>

          </div>


          <div className="info-card">

            <span>02</span>

            <h3>
              Analyze
            </h3>

            <p>
              The CNN processes the image.
            </p>

          </div>


          <div className="info-card">

            <span>03</span>

            <h3>
              Predict
            </h3>

            <p>
              Receive the digit and confidence score.
            </p>

          </div>

        </section>

      </main>


      <footer>

        <p>
          MNIST Vision · Powered by TensorFlow + FastAPI + React
        </p>

      </footer>

    </div>
  );
}

export default App;