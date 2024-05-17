from fastapi import FastAPI, HTTPException
import mysql.connector
from fastapi.responses import FileResponse
from pydantic import BaseModel
from starlette.responses import HTMLResponse
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI()
todo_list = []


@app.get("/")
async def read_root():
    return FileResponse("test.html")

# MySQL 서버에 연결
conn = mysql.connector.connect(
    host="localhost",
    user="user1",
    password="user1",
    database="test"
)

# db접속 상태 확인
if conn.is_connected():
    print("DB 연결 OK")
else:
    print("DB 연결 NO")
    
cursor = conn.cursor()

# 데이터를 전송하기 위한 모델 정의
class TestData(BaseModel):
    targetUrl: str
    testName: str
    userNum: int
    userPlusNum: int
    intervalTime: int
    plusCount: int

# 테스트 생성
@app.post('/add_data')
async def add_data(data: TestData):
    try:
        print(data)
        # 데이터베이스에 데이터 추가
        cursor.execute(
            """
            INSERT INTO tests (targetUrl, testName, userNum, userPlusNum, intervalTime, plusCount)
            VALUES (%s, %s, %s, %s, %s, %s)
            """, 
            (data.targetUrl, data.testName, data.userNum, data.userPlusNum, data.intervalTime, data.plusCount)
        )
        conn.commit()
        testId = cursor.lastrowid
        return {"testId": testId, "testName": data.testName}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@app.delete("/delete_test/{testId}")
def delete_test(testId: int):
    try:
        cursor.execute("DELETE FROM tests WHERE id = %s", (testId,))
        conn.commit()
        return {"message": "Test deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
