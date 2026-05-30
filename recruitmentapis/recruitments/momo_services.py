import hmac
import hashlib
import json
import requests
import uuid
from django.conf import settings

def create_momo_payment(order_id, amount, order_info, return_url, notify_url):
    """
    Hàm gọi sang cổng MoMo lấy link thanh toán sử dụng thuật toán mã hóa chuẩn captureWallet
    """
    # Lấy các cấu hình từ settings.py của bạn
    partner_code = settings.MOMO_PARTNER_CODE
    access_key = settings.MOMO_ACCESS_KEY
    secret_key = settings.MOMO_SECRET_KEY
    endpoint = settings.MOMO_ENDPOINT

    # Sinh requestId ngẫu nhiên theo chuẩn UUID để không bị trùng lặp request
    request_id = str(uuid.uuid4())
    extra_data = ""
    request_type = "payWithMethod"  # Sử dụng chế độ All-In-One để mở full tính năng thẻ

    # 1. Ghép chuỗi raw theo đúng thứ tự bảng chữ cái bắt buộc của MoMo
    raw_signature = (
        f"accessKey={access_key}&amount={amount}&extraData={extra_data}"
        f"&ipnUrl={notify_url}&orderId={order_id}&orderInfo={order_info}"
        f"&partnerCode={partner_code}&redirectUrl={return_url}&requestId={request_id}"
        f"&requestType={request_type}"
    )

    # 2. Mã hóa chữ ký bằng hmac sử dụng bảng mã 'ascii' giống hệt mẫu của MoMo
    h = hmac.new(
        bytes(secret_key, 'ascii'),
        bytes(raw_signature, 'ascii'),
        hashlib.sha256
    )
    signature = h.hexdigest()

    # 3. Tạo cấu trúc Json Payload gửi đi
    payload = {
        'partnerCode': partner_code,
        'partnerName': "Hệ thống Tuyển dụng",
        'storeId': "MomoTestStore",
        'requestId': request_id,
        'amount': str(amount),  # Ép thành chuỗi (string) theo tài liệu MoMo
        'orderId': order_id,
        'orderInfo': order_info,
        'redirectUrl': return_url,
        'ipnUrl': notify_url,
        'lang': "vi",
        'extraData': extra_data,
        'requestType': request_type,
        'signature': signature
    }

    data_json = json.dumps(payload)
    content_length = str(len(data_json))

    headers = {
        'Content-Type': 'application/json',
        'Content-Length': content_length
    }

    try:
        response = requests.post(endpoint, data=data_json, headers=headers)
        return response.json()
    except Exception as e:
        return {"resultCode": -1, "message": str(e)}
