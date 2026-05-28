# recruitments/middleware.py

import json
from io import BytesIO

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class OauthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if (request.path == '/o/token/') and request.method == 'POST':

            # Trường hợp 1: Frontend gửi dữ liệu dạng application/x-www-form-urlencoded (Form Data)
            if request.content_type == 'application/x-www-form-urlencoded':
                # Sửa đổi nội dung POST để nhét client_id và client_secret vào
                post_data = request.POST.copy()
                post_data['client_id'] = settings.CLIENT_ID
                post_data['client_secret'] = settings.CLIENT_SECRET
                request.POST = post_data

            # Trường hợp 2: Frontend gửi dữ liệu dạng application/json
            elif request.content_type == 'application/json':
                try:
                    data = json.loads(request.body)
                    data['client_id'] = settings.CLIENT_ID
                    data['client_secret'] = settings.CLIENT_SECRET
                    # Ghi đè lại request.body với dữ liệu mới
                    new_body = json.dumps(data).encode('utf-8')
                    request._body = new_body

                    request._stream = BytesIO(new_body)
                    request.META['CONTENT_LENGTH'] = len(new_body)
                except Exception as e:
                    pass