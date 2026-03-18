from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Tambahkan direktori api/ ke path agar bisa import inference.py
sys.path.append(os.path.dirname(__file__))
from inference import run_inference

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Baca body request
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            # Ekstrak data dari request
            gdp_val = data.get('gdp', 0)
            gds_val = data.get('gds', 0)
            preg_val = data.get('preg', False)
            gejala_vals = data.get('gejala', {})

            # Jalankan inference
            result = run_inference(gdp_val, gds_val, preg_val, gejala_vals)

            # Urutkan hasil dari CF tertinggi ke terendah
            sorted_result = sorted(result.items(), key=lambda item: item[1], reverse=True)

            if sorted_result:
                diagnosis_akhir = sorted_result[0][0]
                nilai_cf = sorted_result[0][1]
            else:
                diagnosis_akhir = "Tidak diketahui"
                nilai_cf = 0.0

            response = {
                "status": "success",
                "diagnosis_akhir": diagnosis_akhir,
                "nilai_cf": nilai_cf,
                "detail_hasil": dict(sorted_result)
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            error_response = {
                "status": "error",
                "message": str(e)
            }
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
