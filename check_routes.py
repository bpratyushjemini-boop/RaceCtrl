import urllib.request
from urllib.error import HTTPError, URLError

urls = [
    'http://127.0.0.1:3000/',
    'http://127.0.0.1:3000/standings',
    'http://127.0.0.1:3000/constructors',
    'http://127.0.0.1:3000/timing',
    'http://127.0.0.1:3000/settings',
]

for url in urls:
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            print(url, r.status)
    except HTTPError as e:
        print(url, 'HTTP', e.code)
    except URLError as e:
        print(url, 'ERROR', e.reason)
    except Exception as e:
        print(url, 'ERROR', e)
