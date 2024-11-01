import base64
import time 
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import requests 
from urllib.parse import  parse_qs
import json 
import os
import pyfiglet
from colorama import Fore, Style, init
from user_agent import generate_user_agent


def encode_event(e, t):
    r = f"{e}|{t}|{int(time.time())}"
    n = "tttttttttttttttttttttttttttttttt"
    i = n[:16]
    key = n.encode('utf-8') 
    iv = i.encode('utf-8')
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted = cipher.encrypt(pad(r.encode('utf-8'), AES.block_size))
    return base64.b64encode(base64.b64encode(encrypted)).decode('utf-8')

init(autoreset=True)
headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'access-control-allow-origin': '*',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'lan': 'en',
    'origin': 'https://bbqapp.bbqcoin.ai',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://bbqapp.bbqcoin.ai/',
    'sec-ch-ua': '"Android WebView";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent':'',
    'use-agen': '',
    'x-requested-with': 'org.telegram.messenger',
}


def bbq_tap(query_id ,taps):
    headers['user-agent'] = generate_user_agent('android')
    headers['use-agen'] = query_id
    id = str(json.loads(parse_qs(query_id)['user'][0])['id'])
    data = {
        'id_user':id,
        'mm': taps ,
        'game': encode_event(id,taps),
    }
    r = requests.post('https://bbqbackcs.bbqcoin.ai/api/coin/earnmoney', headers=headers, data=data)
    return (r.text)

def create_gradient_banner(text):
    banner = pyfiglet.figlet_format(text).splitlines()
    colors = [Fore.GREEN + Style.BRIGHT, Fore.YELLOW + Style.BRIGHT, Fore.RED + Style.BRIGHT]
    total_lines = len(banner)
    section_size = total_lines // len(colors)
    for i, line in enumerate(banner):
        if i < section_size:
            print(colors[0] + line)  # Green
        elif i < section_size * 2:
            print(colors[1] + line)  # Yellow
        else:
            print(colors[2] + line)  # Red

def print_info_box(social_media_usernames):
    colors = [Fore.CYAN, Fore.MAGENTA, Fore.LIGHTYELLOW_EX, Fore.BLUE, Fore.LIGHTWHITE_EX]
    
    box_width = max(len(social) + len(username) for social, username in social_media_usernames) + 4
    print(Fore.WHITE + Style.BRIGHT + '+' + '-' * (box_width - 2) + '+')
    
    for i, (social, username) in enumerate(social_media_usernames):
        color = colors[i % len(colors)] 
        print(color + f'| {social}: {username} |')
    
    print(Fore.WHITE + Style.BRIGHT + '+' + '-' * (box_width - 2) + '+')

if __name__ == "__main__":
    banner_text = "BBQ COIN"
    os.system('cls' if os.name == 'nt' else 'clear')
    create_gradient_banner(banner_text)
    social_media_usernames = [
        ("CryptoNews", "@rahatmals"),
        ("Auto Farming", "@rahatmals"),
        ("Auto Farming", "@rahatmals"),
        #("", "@"),
        ("Coder", "@rahatmals"),
    ]
    
    print_info_box(social_media_usernames)
    user_input = input("\nEnter BBQ query ID : ")
    energy = input("Enter your energy value(try 50000 if you are lucky) : ")
    while True:
        data = bbq_tap(user_input,energy)
        time.sleep(0.5)
        try :
            print(Fore.GREEN + Style.BRIGHT + data)
        except:
            print(Fore.RED + Style.BRIGHT + data)
