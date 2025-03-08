import React, { useState, useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import axios from "axios";

const LiveCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [foodDetailsList, setFoodDetailsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [lastDetectedFood, setLastDetectedFood] = useState("");
  const [manualFood, setManualFood] = useState("");
  const [detectionActive, setDetectionActive] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const modelRef = useRef(null);

  useEffect(() => {
    const getCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
    };
    getCameras();
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!cameraOn) {
      stopCameraStream();
      return;
    }

    const loadModel = async () => {
      await tf.ready();
      modelRef.current = await cocoSsd.load();
      detectObjects(modelRef.current);
    };

    const detectObjects = async (model) => {
      if (videoRef.current) {
        try {
          const constraints = { video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined } };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadeddata = async () => {
            setInterval(async () => {
              if (!detectionActive) {
                setDetectionActive(true);
                const predictions = await model.detect(videoRef.current);

                if (predictions.length > 0) {
                  drawPredictions(predictions);

                  const detectedFood = predictions[0].class;
                  if (detectedFood !== lastDetectedFood) {
                    console.log("New Food Detected:", detectedFood);
                    setLastDetectedFood(detectedFood);
                    getFoodDetails(detectedFood);
                  }
                }
                setDetectionActive(false);
              }
            }, 3000);
          };
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      }
    };

    if (selectedCamera) {
      loadModel();
    }

    return () => stopCameraStream();
  }, [selectedCamera, lastDetectedFood, cameraOn]);

  const drawPredictions = (predictions) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      context.strokeStyle = "red";
      context.lineWidth = 2;
      context.strokeRect(x, y, width, height);

      context.fillStyle = "red";
      context.font = "16px Arial";
      context.fillText(prediction.class, x, y > 10 ? y - 5 : y + 15);
    });
  };

  const getFoodDetails = async (food) => {
    if (!food) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/fetch-food-details", { food });
      setFoodDetailsList((prev) => [...prev, { name: food, details: response.data.details }]);
    } catch (error) {
      console.error("Error fetching food details:", error);
    }
    setLoading(false);
  };

  const deleteFoodDetail = (index) => {
    setFoodDetailsList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Live Food Recognition</h1>

      <button
        onClick={() => setCameraOn(!cameraOn)}
        className={`mt-4 px-4 py-2 text-white rounded-lg shadow ${cameraOn ? "bg-red-500" : "bg-green-500"}`}
      >
        {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
      </button>

      <div className="mt-4">
        <label className="text-lg font-medium text-gray-700 mr-2">Select Camera:</label>
        <select
          onChange={(e) => setSelectedCamera(e.target.value)}
          value={selectedCamera}
          className="px-4 py-2 border rounded-lg bg-white shadow-sm"
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
            </option>
          ))}
        </select>
      </div>

      {cameraOn && (
        <div className="relative w-full max-w-lg mt-4">
          <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-lg w-full border" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        </div>
      )}

      <div className="mt-6 flex flex-col items-center">
        <input
          type="text"
          placeholder="Enter food manually"
          value={manualFood}
          onChange={(e) => setManualFood(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none"
        />
        <button
          onClick={() => getFoodDetails(manualFood)}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
        >
          Fetch Details
        </button>
      </div>

      <div className="mt-6 p-4 bg-white shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800">Detected Food Details</h2>
        {loading ? (
          <p className="text-gray-500 mt-2 animate-pulse">Fetching details...</p>
        ) : foodDetailsList.length > 0 ? (
          foodDetailsList.map((food, index) => (
            <div key={index} className="mt-4 p-2 border-b flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-medium">{food.name}</p>
                <p className="text-gray-700 text-sm">{food.details}</p>
              </div>
              <button
                onClick={() => deleteFoodDetail(index)}
                className="px-2 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-2">No food detected yet.</p>
        )}
      </div>
    </div>
  );
};

export default LiveCamera;
