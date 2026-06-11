import requests, json, traceback

BASE = 'http://localhost:4001/api/v1'

try:
    login = requests.post(f'{BASE}/auth/login', json={'phone': '+966500000004', 'password': 'Cust@123'})
    token = login.json()['data']['access_token']
    print(f'Token: {token[:30]}...')

    shop = requests.get(f'{BASE}/shops/')
    shop_id = shop.json()['data']['items'][0]['id']
    print(f'Shop: {shop_id}')

    order = requests.post(f'{BASE}/orders/', headers={'Authorization': f'Bearer {token}'}, json={'shop_id': shop_id, 'total_amount': 350, 'delivery_fee': 30})
    print(f'Order status: {order.status_code}')
    print(f'Response: {order.text}')
except Exception as e:
    traceback.print_exc()
