from socket import create_connection
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import mysql.connector
from pydantic import BaseModel
import subprocess

app = FastAPI()
#--------------------------------------------------------------------------------------------------------------------------------------
# 다른 내용 ### db설정 바꿔주세요
# MySQL 서버에 연결
# MySQL 데이터베이스 연결
db_config = {
    'user': 'root',      
    'password': 'test1234',
    'host': 'database-eof.cnakai2m8xfm.ap-northeast-1.rds.amazonaws.com',  
    'database': 'api'
}

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()
#--------------------------------------------------------------------------------------------------------------------------------------
# 다른 내용 ### db데이터 저장 형식 바꿔주세요
# 데이터를 전송하기 위한 모델 정의
class TestData(BaseModel):
    target_url: str
    test_name: str
    user_num: int
    user_plus_num: int
    interval_time: int
    plus_count: int
#--------------------------------------------------------------------------------------------------------------------------------------
def run_load_testing_script(url, initial_user_count, additional_user_count, interval_time, repeat_count, test_id):
    command = [
        "python",
        "runner.py",
        "--url", url,
        "--initial_user_count", str(initial_user_count),
        "--additional_user_count", str(additional_user_count),
        "--interval_time", str(interval_time),
        "--repeat_count", str(repeat_count),
        "--test_id", str(test_id)
    ]
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
#--------------------------------------------------------------------------------------------------------------------------------------
# 추가한 내용 ### 차트를 그리기 위해 필요한 값을 들고오기 위함
@app.get("/rps_data")
async def get_rps_data():
    try:
        cursor.execute("SELECT recorded_time, RPS, avg_response_time, number_of_users FROM incremental ORDER BY recorded_time ASC")
        result = cursor.fetchall()
        data = {"recorded_times": [row[0] for row in result], "rps_values": [row[1] for row in result], 
                "response_time": [row[2] for row in result], "number_of_users": [row[3] for row in result]}
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
#--------------------------------------------------------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------------------------------------------------------
# 프론트 할 때 필요 ### 아래3개: 페이지 관련 ### 페이지 이름 경로 등 필요한 부분 수정하세요
# '/' 접속 시 test.html 화면 나오게끔
@app.get("/")
async def get_test_html():
    return FileResponse("test.html")

# incremental 실행 시 차트 페이지로 이동
@app.get("/chart")
async def get_chart_html():
    return FileResponse("chart.html")

# spike실행 시 spike 결과 페이지로 이동
@app.get("/spike")
async def get_spike_html():
    return FileResponse("spike.html")
#--------------------------------------------------------------------------------------------------------------------------------------
#--------------------------------------------------------------------------------------------------------------------------------------
# 수정한 내용 ### 가져오는 값 변경 (기존 id, name -> 3개 값 추가)
# 테스트 목록 불러오기
@app.get('/testcase')
async def read_list():
    try:
        cursor.execute("SELECT test_id, test_name, user_plus_num, interval_time, plus_count FROM test")
        result = cursor.fetchall()
        test_data = [{"test_id": row[0], "test_name": row[1], "user_plus_num": row[2], "interval_time": row[3], "plus_count": row[4]} for row in result]
        
        return {"testData": test_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
#--------------------------------------------------------------------------------------------------------------------------------------
# 테스트 생성 
@app.post('/testcase')
async def create_test(data: TestData):
    try: 
        cursor.execute(
            """
            INSERT INTO test (target_url, test_name, user_num, user_plus_num, interval_time, plus_count)
            VALUES (%s, %s, %s, %s, %s, %s)
            """, 
            (data.target_url, data.test_name, data.user_num, data.user_plus_num, data.interval_time, data.plus_count)
        )
        conn.commit()
        test_id = cursor.lastrowid
        return {"test_id": test_id, "test_name": data.test_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# 테스트 삭제
@app.delete("/testcase/{test_id}")
async def delete_test(test_id: int):
    try:
        cursor.execute("DELETE FROM test WHERE test_id = %s", (test_id,))
        conn.commit()
        return {"message": "Test deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.get("/testcase/{test_id}/execute/")
async def execute_test(test_id: int):
    try:
        cursor.execute("SELECT * FROM test WHERE test_id = %s", (test_id,))
        test_data = cursor.fetchone()
        if test_data:
            test_id, target_url, test_name, user_num, user_plus_num, interval_time, plus_count = test_data
            run_load_testing_script(target_url, user_num, user_plus_num, interval_time, plus_count, test_id)
            return {
                "test_id": test_id,
                "target_url": target_url,
                "test_name": test_name,
                "user_num": user_num,
                "user_plus_num": user_plus_num,
                "interval_time": interval_time,
                "plus_count": plus_count,
            }
        else:
            raise HTTPException(status_code=404, detail="Testcase not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
#--------------------------------------------------------------------------------------------------------------------------------------
# 추가한 내용 ### spike에서 화면 출력을 위해 db에서 값을 가져오기 위함 ##### 이 내용 수정중에 있음 (이상하게 작동중)
@app.get("/{test_id}/get_data_from_db")
async def get_spike_data(test_id: int):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT avg_response_time, Failures FROM spike WHERE test_id = %s", (test_id,))
        result = cursor.fetchall()
        print(result)
        data = {
            "averageResponseTime": [row[0] for row in result], 
            "failureRateValue": [row[1] for row in result]
        }
        print(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
