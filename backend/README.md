# 배터리 품질 예측 백엔드 서버
# test
## 설치 및 실행 방법

### 1. Python 환경 설정
```bash
# Python 3.8 이상 필요
python --version
```

### 2. 의존성 설치
```bash
cd backend
pip install -r requirements.txt
```

### 3. 서버 실행
```bash
python app.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### 배치 예측 (주요 기능)
- **URL**: `POST /predict/batch`
- **설명**: CSV 데이터의 각 배치에 대해 defect 확률을 예측합니다
- **요청 형식**:
```json
{
  "batch_data": [
    {
      "particle_size_d50": 150.5,
      "precursor_room_temp": 45.2,
      "precursor_room_humidity": 50.1,
      "precursor_processing_time_min": 120.0,
      "batch_id": "BATCH_00001"
    }
  ]
}
```

### 기타 엔드포인트
- `GET /health` - 서버 상태 확인
- `GET /model/info` - 모델 정보 조회
- `POST /model/retrain` - 모델 재학습
- `POST /user/register` - 사용자 등록
- `POST /user/login` - 사용자 로그인

## 모델 정보
- **알고리즘**: Random Forest Regressor
- **입력 특성**: 
  - particle_size_d50 (입자 크기)
  - precursor_room_temp (건조온도)
  - precursor_room_humidity (습도)
  - precursor_processing_time_min (건조 시간)
  - conductivity (전도도)
  - temperature (온도)
  - humidity (습도)
- **출력**: defect_probability (불량 확률, 0-100%)

## 주의사항
- 첫 실행 시 모델이 자동으로 학습됩니다
- 학습된 모델은 `models/` 폴더에 저장됩니다
- 프론트엔드에서 이 API를 호출하여 실제 예측을 수행합니다 