from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 모델과 스케일러를 저장할 전역 변수
model = None
scaler = None

# 모델 학습 함수
def train_model():
    """배터리 품질 예측 모델 학습"""
    global model, scaler
    
    # 샘플 학습 데이터 생성 (실제 환경에서는 실제 데이터 사용)
    np.random.seed(42)
    n_samples = 1000
    
    # 특성 데이터 생성
    data = {
        'particle_size_d50': np.random.normal(150, 20, n_samples),
        'precursor_room_temp': np.random.normal(45, 5, n_samples),
        'precursor_room_humidity': np.random.normal(50, 10, n_samples),
        'precursor_processing_time_min': np.random.normal(120, 15, n_samples),
        'conductivity': np.random.normal(85, 10, n_samples),
        'temperature': np.random.normal(25, 3, n_samples),
        'humidity': np.random.normal(50, 8, n_samples)
    }
    
    # 타겟 변수 (defect rate) 생성 - 특성들과 상관관계 있게 생성
    defect_rate = (
        0.1 * (data['particle_size_d50'] - 150) / 20 +
        0.05 * (data['precursor_room_temp'] - 45) / 5 +
        0.03 * (data['precursor_room_humidity'] - 50) / 10 +
        0.02 * (data['precursor_processing_time_min'] - 120) / 15 +
        -0.05 * (data['conductivity'] - 85) / 10 +
        0.02 * (data['temperature'] - 25) / 3 +
        0.01 * (data['humidity'] - 50) / 8 +
        np.random.normal(0, 0.02, n_samples)
    ) * 100 + 5  # 5% 베이스라인
    
    # 음수 값을 0으로, 너무 큰 값을 제한
    defect_rate = np.clip(defect_rate, 0, 20)
    
    # DataFrame 생성
    df = pd.DataFrame(data)
    X = df.values
    y = defect_rate
    
    # 스케일링
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 모델 학습
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    
    # 모델 저장
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/defect_prediction_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    print("모델 학습 완료!")
    return model, scaler

# 모델 로드 함수
def load_model():
    """저장된 모델 로드"""
    global model, scaler
    
    try:
        model = joblib.load('models/defect_prediction_model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        print("저장된 모델 로드 완료!")
        return True
    except FileNotFoundError:
        print("저장된 모델을 찾을 수 없습니다. 새로 학습합니다.")
        return False

# 앱 시작 시 모델 초기화
@app.before_first_request
def initialize():
    if not load_model():
        train_model()

# 사용자 등록 API (기존 코드에서 사용되는 것 같음)
@app.route('/user/register', methods=['POST'])
def register():
    try:
        data = request.json
        # 간단한 더미 구현 (실제 환경에서는 데이터베이스 사용)
        return jsonify({
            'success': True,
            'message': '회원가입이 완료되었습니다.'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': '회원가입 중 오류가 발생했습니다.'
        }), 500

# 사용자 로그인 API
@app.route('/user/login', methods=['POST'])
def login():
    try:
        data = request.json
        # 간단한 더미 구현 (실제 환경에서는 데이터베이스 사용)
        return jsonify({
            'success': True,
            'message': '로그인 성공',
            'user': {
                'id': '1',
                'email': data.get('email'),
                'name': '테스트 사용자'
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': '로그인 중 오류가 발생했습니다.'
        }), 500

# 학습 라우트 - 배터리 품질 예측 API
@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """배치 데이터를 받아서 defect 예측 수행"""
    try:
        data = request.json
        batch_data = data.get('batch_data', [])
        
        if not batch_data:
            return jsonify({
                'success': False,
                'message': '배치 데이터가 없습니다.'
            }), 400
        
        predictions = []
        
        for i, batch in enumerate(batch_data):
            # 배치 데이터에서 특성 추출
            features = []
            
            # 필수 특성들 추출 (CSV 데이터 기준)
            particle_size = float(batch.get('particle_size_d50', 150))
            precursor_temp = float(batch.get('precursor_room_temp', 45))
            precursor_humidity = float(batch.get('precursor_room_humidity', 50))
            processing_time = float(batch.get('precursor_processing_time_min', 120))
            
            # 추가 특성들 (기본값 사용)
            conductivity = float(batch.get('conductivity', 85))
            temperature = float(batch.get('temperature', 25))
            humidity = float(batch.get('humidity', 50))
            
            features = [
                particle_size,
                precursor_temp,
                precursor_humidity,
                processing_time,
                conductivity,
                temperature,
                humidity
            ]
            
            # 특성 스케일링
            features_scaled = scaler.transform([features])
            
            # 예측 수행
            defect_prediction = model.predict(features_scaled)[0]
            
            # 배치 ID 생성
            batch_id = batch.get('batch_id', f'BATCH_{str(i + 1).zfill(5)}')
            
            # 예측 결과 저장
            prediction_result = {
                'batch_id': batch_id,
                'defect_probability': max(0, min(100, defect_prediction)),  # 0-100% 범위로 제한
                'particle_size_d50': particle_size,
                'precursor_room_temp': precursor_temp,
                'precursor_room_humidity': precursor_humidity,
                'precursor_processing_time_min': processing_time,
                'conductivity': conductivity,
                'temperature': temperature,
                'humidity': humidity,
                'timestamp': datetime.now().isoformat()
            }
            
            predictions.append(prediction_result)
        
        return jsonify({
            'success': True,
            'message': f'{len(predictions)}개 배치 예측 완료',
            'predictions': predictions
        })
        
    except Exception as e:
        print(f"예측 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'예측 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 모델 재학습 API
@app.route('/model/retrain', methods=['POST'])
def retrain_model():
    """모델 재학습"""
    try:
        train_model()
        return jsonify({
            'success': True,
            'message': '모델 재학습이 완료되었습니다.'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'모델 재학습 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 모델 정보 조회 API
@app.route('/model/info', methods=['GET'])
def model_info():
    """모델 정보 조회"""
    try:
        return jsonify({
            'success': True,
            'model_type': 'RandomForestRegressor',
            'features': [
                'particle_size_d50',
                'precursor_room_temp',
                'precursor_room_humidity',
                'precursor_processing_time_min',
                'conductivity',
                'temperature',
                'humidity'
            ],
            'target': 'defect_probability',
            'last_updated': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'모델 정보 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 헬스 체크 API
@app.route('/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    # 모델 초기화
    if not load_model():
        train_model()
    
    app.run(debug=True, host='0.0.0.0', port=5000) 