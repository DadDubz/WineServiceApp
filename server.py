import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from datetime import datetime

PORT = 8000

# Simple in-memory data
USERS = {
    "demo": {"password": "demo", "name": "Demo User"},
    "server1": {"password": "pass", "name": "John Server"},
    "expo1": {"password": "pass", "name": "Emma Expo"},
    "sommelier1": {"password": "pass", "name": "Sam Sommelier"},
    "manager1": {"password": "pass", "name": "Mike Manager"},
}

WINES = [
    {"id": 1, "name": "Chardonnay", "producer": "Sonoma Vineyards", "type": "White", "vintage": 2019, "region": "Sonoma, CA", "price": 65, "stock": 24},
    {"id": 2, "name": "Pinot Noir", "producer": "Willamette Valley Vineyards", "type": "Red", "vintage": 2018, "region": "Willamette Valley, OR", "price": 78, "stock": 18},
    {"id": 3, "name": "Cabernet Sauvignon", "producer": "Napa Cellars", "type": "Red", "vintage": 2017, "region": "Napa Valley, CA", "price": 95, "stock": 12},
]

TABLES = []
NEXT_TABLE_ID = 1
NEXT_WINE_ID = 4

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/wines":
            self._set_headers()
            self.wfile.write(json.dumps(WINES).encode())
        elif parsed.path == "/api/tables":
            self._set_headers()
            self.wfile.write(json.dumps(TABLES).encode())
        elif parsed.path == "/api/reports":
            qs = parse_qs(parsed.query)
            rtype = qs.get("type", ["inventory"])[0]
            self._set_headers()
            if rtype == "inventory":
                total = sum(w["stock"] for w in WINES)
                resp = {"total_bottles": total, "wine_count": len(WINES)}
            else:
                resp = {"message": "demo report"}
            self.wfile.write(json.dumps(resp).encode())
        else:
            # Serve static files
            if parsed.path == "/":
                path = "index.html"
            else:
                path = parsed.path.lstrip("/")
            try:
                with open(path, "rb") as f:
                    content = f.read()
                    if path.endswith(".html"):
                        ctype = "text/html"
                    elif path.endswith(".js"):
                        ctype = "application/javascript"
                    elif path.endswith(".css"):
                        ctype = "text/css"
                    else:
                        ctype = "application/octet-stream"
                    self._set_headers(content_type=ctype)
                    self.wfile.write(content)
            except FileNotFoundError:
                self._set_headers(404)
                self.wfile.write(b"Not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get('content-length', 0))
        data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(data)
        except Exception:
            payload = {}

        if parsed.path == "/api/login":
            username = payload.get("username")
            password = payload.get("password")
            user = USERS.get(username)
            if user and user["password"] == password:
                resp = {"success": True, "name": user["name"]}
                self._set_headers()
                self.wfile.write(json.dumps(resp).encode())
            else:
                self._set_headers(401)
                self.wfile.write(json.dumps({"success": False}).encode())
        elif parsed.path == "/api/wines":
            global NEXT_WINE_ID
            wine = {
                "id": NEXT_WINE_ID,
                "name": payload.get("name"),
                "producer": payload.get("producer", ""),
                "type": payload.get("type"),
                "vintage": payload.get("vintage"),
                "region": payload.get("region", ""),
                "price": payload.get("price", 0),
                "stock": payload.get("stock", 0),
            }
            NEXT_WINE_ID += 1
            WINES.append(wine)
            self._set_headers(201)
            self.wfile.write(json.dumps(wine).encode())
        elif parsed.path == "/api/tables":
            global NEXT_TABLE_ID
            table = {
                "id": NEXT_TABLE_ID,
                "number": payload.get("number"),
                "server": payload.get("server"),
                "guests": payload.get("guests", 0),
                "roomNumber": payload.get("roomNumber", ""),
                "notes": payload.get("notes", ""),
                "status": payload.get("status", "Seated"),
                "arrivalTime": datetime.utcnow().isoformat(),
                "courses": [],
            }
            NEXT_TABLE_ID += 1
            TABLES.append(table)
            self._set_headers(201)
            self.wfile.write(json.dumps(table).encode())
        elif parsed.path.startswith("/api/tables/") and parsed.path.endswith("/courses"):
            try:
                table_id = int(parsed.path.split("/")[3])
            except Exception:
                self._set_headers(400)
                self.wfile.write(b"invalid id")
                return
            table = next((t for t in TABLES if t["id"] == table_id), None)
            if not table:
                self._set_headers(404)
                self.wfile.write(b"not found")
                return
            course = {
                "name": payload.get("name"),
                "wine": payload.get("wine", ""),
                "status": "Ordered",
            }
            table["courses"].append(course)
            self._set_headers(201)
            self.wfile.write(json.dumps(course).encode())
        else:
            self._set_headers(404)
            self.wfile.write(b"Not found")

    def do_PUT(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get('content-length', 0))
        data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(data)
        except Exception:
            payload = {}

        if parsed.path.startswith("/api/wines/"):
            try:
                wine_id = int(parsed.path.split("/")[3])
            except Exception:
                self._set_headers(400)
                self.wfile.write(b"invalid id")
                return
            wine = next((w for w in WINES if w["id"] == wine_id), None)
            if not wine:
                self._set_headers(404)
                self.wfile.write(b"not found")
                return
            wine.update(payload)
            self._set_headers()
            self.wfile.write(json.dumps(wine).encode())
        else:
            self._set_headers(404)
            self.wfile.write(b"Not found")

def run():
    with HTTPServer(("", PORT), Handler) as httpd:
        print(f"Serving on port {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    run()
