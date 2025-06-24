import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load or train model
try:
    model = joblib.load('equipment_failure_model.pkl')
    print("Loaded pre-trained model")
except:
    print("Training new model...")
    # Mock training data
    np.random.seed(42)
    data_size = 1000
    X = np.random.rand(data_size, 5)  # 5 features: temp, vibration, pressure, power, runtime
    y = (X.sum(axis=1) + np.random.normal(0, 0.2, data_size) > 2.5).astype(int)  # Failure if sum > 2.5
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # Save model
    joblib.dump(model, 'equipment_failure_model.pkl')
    print(f"Model trained with accuracy: {model.score(X_test, y_test):.2f}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = np.array([
            data['temperature'],
            data['vibration'],
            data['pressure'],
            data['power'],
            data['runtime']
        ]).reshape(1, -1)
        
        proba = model.predict_proba(features)[0]
        prediction = int(model.predict(features)[0])
        
        return jsonify({
            'failure_probability': float(proba[1]),
            'prediction': prediction,
            'recommendation': 'Immediate maintenance' if proba[1] > 0.7 
                            else 'Schedule maintenance' if proba[1] > 0.4 
                            else 'No action needed'
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(port=5001)