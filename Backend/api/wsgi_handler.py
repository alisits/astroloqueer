from asgiref.wsgi import WsgiToAsgi
from mangum import Mangum
from app import app

asgi_app = WsgiToAsgi(app)
handler = Mangum(asgi_app, lifespan="off")
