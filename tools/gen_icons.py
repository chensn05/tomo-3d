#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TOMO 手绘图标系统生成器
风格：奶油底 + 深棕手绘墨线 + 低饱和粉彩填充 + 轻微手抖感
输出：src/icons/tomoIcons.ts （name -> inner SVG）
"""
import os, json

INK   = '#6B4A3A'   # 深棕墨线
RED   = '#E4574C'   # 番茄红
RED_D = '#C4433A'
PINK  = '#F5B9C5'
BLUE  = '#A9D6DF'
GREEN = '#8FC79A'
GRN_D = '#5E9C6C'
YEL   = '#F3D08A'
PUR   = '#C9B9DF'
CREAM = '#FFF6E8'
GREY  = '#D8CFC4'
BRN   = '#B98A5E'
ORG   = '#F0A070'

S = f'fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
def st(w=1.8, c=INK):
    return f'fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"'
def fl(color, w=1.8):
    return f'fill="{color}" stroke="{INK}" stroke-width="{w}" stroke-linejoin="round"'

ICONS = {}

# ───────────────────────── 表情系统：TOMO 番茄脸 ─────────────────────────
def tomato_face(eyes, mouth, extra='', body=RED, blush=True):
    """统一番茄脸底座 + 可变五官"""
    b = f'''<path d="M16 7.6c5 0 8.6 3.5 8.6 8.4 0 5.2-3.8 8.6-8.6 8.6s-8.6-3.4-8.6-8.6c0-4.9 3.6-8.4 8.6-8.4z" {fl(body)}/>'''
    leaf = f'''<path d="M16 8.2V5.4M16 6.6c-1.5-1.6-3.2-1.9-4.4-1.6.5 1.6 2 2.7 4.4 2.6zM16 6.6c1.5-1.6 3.2-1.9 4.4-1.6-.5 1.6-2 2.7-4.4 2.6z" {fl(GREEN,1.6)}/>'''
    bl = f'<ellipse cx="10.4" cy="18.4" rx="1.7" ry="1.1" fill="{PINK}" opacity=".85"/><ellipse cx="21.6" cy="18.4" rx="1.7" ry="1.1" fill="{PINK}" opacity=".85"/>' if blush else ''
    return b + leaf + bl + eyes + mouth + extra

E_DOT  = f'<circle cx="12.6" cy="15.4" r="1.15" fill="{INK}"/><circle cx="19.4" cy="15.4" r="1.15" fill="{INK}"/>'
E_ARC  = f'<path d="M11.2 15.6q1.4-1.6 2.8 0M18 15.6q1.4-1.6 2.8 0" {st(1.7)}/>'          # 开心弯眼
E_CRY  = f'<path d="M11.2 14.6q1.4 1.7 2.8 0M18 14.6q1.4 1.7 2.8 0" {st(1.7)}/>'          # 哭 ∩
E_X    = f'<path d="M11.4 14.4l2.2 2.2M13.6 14.4l-2.2 2.2M18.4 14.4l2.2 2.2M20.6 14.4l-2.2 2.2" {st(1.6)}/>'
E_WIDE = f'<circle cx="12.6" cy="15.3" r="1.9" fill="{CREAM}" stroke="{INK}" stroke-width="1.4"/><circle cx="19.4" cy="15.3" r="1.9" fill="{CREAM}" stroke="{INK}" stroke-width="1.4"/><circle cx="12.6" cy="15.5" r=".85" fill="{INK}"/><circle cx="19.4" cy="15.5" r=".85" fill="{INK}"/>'
E_LINE = f'<path d="M11.3 15.4h2.6M18.1 15.4h2.6" {st(1.7)}/>'
E_ANG  = f'<path d="M11 14.1l2.8 1.1M21 14.1l-2.8 1.1" {st(1.7)}/><circle cx="12.6" cy="16.1" r="1" fill="{INK}"/><circle cx="19.4" cy="16.1" r="1" fill="{INK}"/>'
E_SLEEP= f'<path d="M11.2 15.4q1.4 1.5 2.8 0M18 15.4q1.4 1.5 2.8 0" {st(1.7)}/>'

M_SMILE= f'<path d="M13 19.3q3 2.4 6 0" {st(1.7)}/>'
M_BIG  = f'<path d="M12.6 18.6q3.4 3.6 6.8 0z" fill="{CREAM}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>'
M_FLAT = f'<path d="M13.2 19.7h5.6" {st(1.7)}/>'
M_SAD  = f'<path d="M13 20.4q3-2.4 6 0" {st(1.7)}/>'
M_O    = f'<ellipse cx="16" cy="19.6" rx="1.7" ry="2.1" fill="{RED_D}" stroke="{INK}" stroke-width="1.5"/>'
M_WAVE = f'<path d="M13 19.8q1.5-1.2 3 0t3 0" {st(1.7)}/>'
M_CAT  = f'<path d="M13.2 19.4q1.4 1.6 2.8 0q1.4 1.6 2.8 0" {st(1.7)}/>'

ICONS['face-happy']    = tomato_face(E_ARC,  M_SMILE)
ICONS['face-calm']     = tomato_face(E_DOT,  M_SMILE)
ICONS['face-laugh']    = tomato_face(E_ARC,  M_BIG)
ICONS['face-cry']      = tomato_face(E_CRY,  M_SAD, f'<path d="M12.4 17.6c-.4 1.5-.4 2.6.2 3.4M19.6 17.6c.4 1.5.4 2.6-.2 3.4" {st(1.5,BLUE)}/>')
ICONS['face-sad']      = tomato_face(E_CRY,  M_SAD)
ICONS['face-angry']    = tomato_face(E_ANG,  M_SAD, f'<path d="M22.6 9.6l1.8-1.4M23.6 12.2l2.2-.5" {st(1.5,RED_D)}/>')
ICONS['face-mad']      = tomato_face(E_ANG,  M_FLAT)
ICONS['face-think']    = tomato_face(E_DOT,  f'<path d="M13.6 19.8q2 -1 4 .4" {st(1.7)}/>', f'<path d="M24.4 11.6a2 2 0 1 1 1.4 3.4c-.6.6-.6 1.2-.4 1.6" {st(1.5)}/><circle cx="25.6" cy="19.4" r=".9" fill="{INK}"/>')
ICONS['face-shy']      = tomato_face(E_ARC,  M_FLAT, f'<ellipse cx="9.6" cy="18.2" rx="2.1" ry="1.4" fill="{PINK}"/><ellipse cx="22.4" cy="18.2" rx="2.1" ry="1.4" fill="{PINK}"/>', blush=False)
ICONS['face-shock']    = tomato_face(E_WIDE, M_O)
ICONS['face-flat']     = tomato_face(E_LINE, M_FLAT)
ICONS['face-cool']     = tomato_face(f'<path d="M9.8 14.4h12.4" {st(1.6)}/><path d="M10.4 14.4h4.6v2.6a1.6 1.6 0 0 1-1.6 1.6h-1.4a1.6 1.6 0 0 1-1.6-1.6z" {fl(INK,1.2)}/><path d="M17 14.4h4.6v2.6a1.6 1.6 0 0 1-1.6 1.6h-1.4a1.6 1.6 0 0 1-1.6-1.6z" {fl(INK,1.2)}/>', M_SMILE, blush=False)
ICONS['face-sick']     = tomato_face(E_X,    M_WAVE, f'<path d="M10.6 21.6h4" {st(2.2,BLUE)}/>', body='#D98A7E')
ICONS['face-sleep']    = tomato_face(E_SLEEP,f'<ellipse cx="16" cy="19.8" rx="1.4" ry="1.7" fill="{RED_D}" stroke="{INK}" stroke-width="1.4"/>', f'<path d="M23 11h3l-3 3.2h3" {st(1.5,BLUE)}/>')
ICONS['face-love']     = tomato_face(f'<path d="M11 15.8c0-1.2 1.5-1.7 1.7-.6.2-1.1 1.7-.6 1.7.6 0 1-1.7 2-1.7 2s-1.7-1-1.7-2zM17.6 15.8c0-1.2 1.5-1.7 1.7-.6.2-1.1 1.7-.6 1.7.6 0 1-1.7 2-1.7 2s-1.7-1-1.7-2z" {fl(PINK,1.3)}/>', M_SMILE)
ICONS['face-smug']     = tomato_face(f'<path d="M11.2 15.2q1.4-1.4 2.8 .2M18 15.4h2.6" {st(1.7)}/>', f'<path d="M13.4 19.6q2.6 1.6 5-.6" {st(1.7)}/>')
ICONS['face-scared']   = tomato_face(E_WIDE, f'<path d="M13 20.6q1.5-1.4 3 0t3 0" {st(1.7)}/>', f'<path d="M11 21.8c-.3 1.2-.3 2-.1 2.6" {st(1.4,BLUE)}/>')
ICONS['face-cat']      = tomato_face(E_ARC,  M_CAT)
ICONS['face-wink']     = tomato_face(f'<path d="M11.2 15.6q1.4-1.6 2.8 0" {st(1.7)}/><circle cx="19.4" cy="15.4" r="1.15" fill="{INK}"/>', M_SMILE)
ICONS['face-cold']     = tomato_face(E_SLEEP, f'<path d="M13 19.8q1.5-1.2 3 0t3 0" {st(1.7)}/>', f'<path d="M7 10.4l1.8 1.8M8.8 10.4L7 12.2M24 21l1.8 1.8M25.8 21L24 22.8" {st(1.4,BLUE)}/>', body='#C9D9E4')
ICONS['face-proud']    = tomato_face(f'<path d="M11.2 15.9q1.4-1.7 2.8 0M18 15.9q1.4-1.7 2.8 0" {st(1.7)}/>', f'<path d="M13.2 19.4q2.8 2 5.6 0" {st(1.7)}/>', f'<path d="M12 6.2l1.2 2.4 2.6.4-1.9 1.8.5 2.6" fill="none" stroke="{YEL}" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>')
ICONS['face-blank']    = tomato_face(E_LINE, f'<circle cx="16" cy="19.8" r="1" fill="{INK}"/>')
ICONS['face-peek']     = tomato_face(f'<path d="M9.6 15.2h12.8" {st(1.7)}/><circle cx="12.6" cy="17" r="1.1" fill="{INK}"/><circle cx="19.4" cy="17" r="1.1" fill="{INK}"/>', M_FLAT)

# ───────────────────────── 功能 dock 图标 ─────────────────────────
ICONS['book'] = f'''<path d="M4.6 7.4c3.4-1 7-1 10.4.8v16.4c-3.4-1.8-7-1.8-10.4-.8z" {fl(CREAM)}/>
<path d="M27.4 7.4c-3.4-1-7-1-10.4.8v16.4c3.4-1.8 7-1.8 10.4-.8z" {fl(PINK)}/>
<path d="M16 8.2v16.4" {st(1.8)}/><path d="M7.4 12h4.6M7.4 15.4h4.6M20 12h4.6" {st(1.3)} opacity=".7"/>'''

ICONS['palette'] = f'''<path d="M16 5.2c6.4 0 10.8 3.8 10.8 8.8 0 4-3.2 5.2-5.4 5.2-1.6 0-2.6.8-2.6 2 0 1.4 1.2 1.8 1.2 3 0 1.6-1.6 2.6-4 2.6C9.2 26.8 5.2 22 5.2 15.6 5.2 9.4 9.8 5.2 16 5.2z" {fl(CREAM)}/>
<circle cx="11" cy="11.4" r="1.7" fill="{RED}"/><circle cx="16.6" cy="9.6" r="1.7" fill="{YEL}"/><circle cx="21.4" cy="12.4" r="1.7" fill="{BLUE}"/><circle cx="10.4" cy="18" r="1.7" fill="{GREEN}"/>'''

ICONS['scene'] = f'''<rect x="4.2" y="7" width="23.6" height="18" rx="3" {fl(BLUE)}/>
<circle cx="11" cy="13" r="2.2" fill="{YEL}" stroke="{INK}" stroke-width="1.4"/>
<path d="M4.6 21.4l6-6.4 5 5.2 4-3.4 7.8 8" {fl(GREEN,1.6)}/>'''

ICONS['codex'] = f'''<path d="M6 6.4h13.4a3.6 3.6 0 0 1 3.6 3.6v15.6H9.6A3.6 3.6 0 0 1 6 22z" {fl(GREEN)}/>
<path d="M9.2 6.4v19.2" {st(1.5)}/><path d="M25.4 8.6v17" {st(1.6)} opacity=".55"/>
<path d="M13 12.6h6M13 16.2h6" {st(1.4,CREAM)}/>'''

ICONS['clock'] = f'''<circle cx="16" cy="17.6" r="9.2" {fl(CREAM)}/>
<path d="M16 8.4V6.2M13 5.4h6" {st(1.8)}/>
<path d="M16 12.4v5.4l3.6 2.4" {st(1.8,RED)}/>
<circle cx="16" cy="17.6" r="1.1" fill="{INK}"/>
<path d="M16 6.4c-1.4-1.4-1.2-2.6 0-3.4 1.2.8 1.4 2 0 3.4z" {fl(GREEN,1.4)}/>'''

ICONS['crystal'] = f'''<path d="M16 5.4l7 6.6-7 13-7-13z" {fl(PUR)}/>
<path d="M9 12h14M16 5.4v19.6M12.4 12l3.6 13M19.6 12l-3.6 13" {st(1.3)} opacity=".55"/>
<path d="M25 8.2l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" fill="{YEL}"/>'''

ICONS['tree'] = f'''<path d="M16 4.6c4.8 0 8 3.4 8 7.6 0 2.4-1 4.4-2.8 5.6.6 1 .8 2 .8 2.8 0 3-2.6 5-6 5s-6-2-6-5c0-.8.2-1.8.8-2.8C9 16.6 8 14.6 8 12.2c0-4.2 3.2-7.6 8-7.6z" {fl(GREEN)}/>
<ellipse cx="16" cy="20.2" rx="2.4" ry="3.2" fill="{INK}"/>
<path d="M14 27.4h4" {st(2.2,BRN)}/>'''

ICONS['mask'] = f'''<path d="M4.6 9.6h9.8v6.2c0 3.2-2.2 5.4-4.9 5.4S4.6 19 4.6 15.8z" {fl(PINK)}/>
<path d="M17.6 9.6h9.8v6.2c0 3.2-2.2 5.4-4.9 5.4s-4.9-2.2-4.9-5.4z" {fl(BLUE)}/>
<path d="M14.4 12.4h3.2" {st(1.6)}/>
<circle cx="7.6" cy="13.4" r=".9" fill="{INK}"/><circle cx="11.4" cy="13.4" r=".9" fill="{INK}"/>
<circle cx="20.6" cy="13.4" r=".9" fill="{INK}"/><circle cx="24.4" cy="13.4" r=".9" fill="{INK}"/>'''

ICONS['sprout'] = f'''<path d="M16 27V13.4" {st(2,GRN_D)}/>
<path d="M16 15.6c-4.4 0-6.4-2.4-6.4-5.6 3.8-.6 6.4 1.6 6.4 5.6z" {fl(GREEN,1.6)}/>
<path d="M16 13c3.6 0 5.4-2 5.4-4.8-3.2-.5-5.4 1.4-5.4 4.8z" {fl(GREEN,1.6)}/>
<path d="M9.6 27h12.8" {st(2,BRN)}/>'''

ICONS['cocktail'] = f'''<path d="M6.6 8.4h18.8L16 18.4z" {fl(BLUE)}/>
<path d="M16 18.4v7M11.6 25.6h8.8" {st(1.9)}/>
<circle cx="20.6" cy="6.4" r="2" {fl(RED,1.4)}/>
<path d="M20.6 4.6l1.8-2" {st(1.4,GRN_D)}/>
<path d="M11 11.6h10" {st(1.3,CREAM)} opacity=".8"/>'''

ICONS['gift'] = f'''<rect x="5" y="12.6" width="22" height="13.4" rx="2.4" {fl(PINK)}/>
<rect x="3.6" y="8.4" width="24.8" height="5" rx="2" {fl(CREAM)}/>
<path d="M16 8.4V26" {st(1.7)}/>
<path d="M16 8.4c-2.6-3.6-6.4-3-6.4-.6 0 1.6 3 1.6 6.4.6zM16 8.4c2.6-3.6 6.4-3 6.4-.6 0 1.6-3 1.6-6.4.6z" {fl(RED,1.5)}/>'''

# ───────────────────────── 通用界面 ─────────────────────────
ICONS['close'] = f'<path d="M9.4 9.4l13.2 13.2M22.6 9.4L9.4 22.6" {st(2.4)}/>'
ICONS['check'] = f'<path d="M7 16.8l6 6 12-13" {st(2.6,GRN_D)}/>'
ICONS['arrow-right'] = f'<path d="M6.4 16h18M18.4 9.6L24.8 16l-6.4 6.4" {st(2.2)}/>'
ICONS['arrow-left']  = f'<path d="M25.6 16h-18M13.6 9.6L7.2 16l6.4 6.4" {st(2.2)}/>'
ICONS['arrow-down']  = f'<path d="M16 6.4v18M9.6 18.4L16 24.8l6.4-6.4" {st(2.2)}/>'
ICONS['refresh'] = f'''<path d="M25.4 16a9.4 9.4 0 1 1-3.2-7.1" {st(2.2)}/><path d="M22.8 3.6v5.6h-5.6" {st(2.2)}/>'''
ICONS['camera'] = f'''<rect x="3.6" y="9.4" width="24.8" height="16.4" rx="3.2" {fl(CREAM)}/>
<path d="M11.4 9.4l1.8-3h5.6l1.8 3" {fl(PINK,1.6)}/>
<circle cx="16" cy="17.8" r="5" {fl(BLUE)}/><circle cx="16" cy="17.8" r="2" fill="{CREAM}"/>'''
ICONS['image'] = f'''<rect x="4" y="6.4" width="24" height="19.2" rx="2.8" {fl(CREAM)}/>
<circle cx="11" cy="12.4" r="2" fill="{YEL}"/>
<path d="M4.4 21.4l6.6-6.6 4.6 4.6 4.2-3.6 7.8 7" {fl(GREEN,1.6)}/>'''
ICONS['download'] = f'''<path d="M16 5.4v13.2M10.4 13.4L16 19l5.6-5.6" {st(2.2)}/><path d="M6 22v3.4a1.6 1.6 0 0 0 1.6 1.6h16.8a1.6 1.6 0 0 0 1.6-1.6V22" {st(2.2)}/>'''
ICONS['key'] = f'''<circle cx="10.6" cy="12.4" r="5.4" {fl(YEL)}/><circle cx="10.6" cy="12.4" r="1.8" fill="{CREAM}"/>
<path d="M14.4 16.2l9.4 9.4M20.6 22.4l2.4-2.4M23.4 25.2l2.6-2.6" {st(2.2)}/>'''
ICONS['lock-open'] = f'''<rect x="6.6" y="14" width="18.8" height="12.4" rx="3" {fl(YEL)}/>
<path d="M11 14V10.6a5 5 0 0 1 9.8-1.4" {st(2)}/><circle cx="16" cy="20.2" r="1.8" fill="{INK}"/>'''
ICONS['idea'] = f'''<path d="M16 4.6c4.4 0 7.6 3.2 7.6 7.2 0 3-2 4.8-3 6.4-.6 1-.6 1.8-.6 2.6h-8c0-.8 0-1.6-.6-2.6-1-1.6-3-3.4-3-6.4 0-4 3.2-7.2 7.6-7.2z" {fl(YEL)}/>
<path d="M12.4 23h7.2M13.4 26.2h5.2" {st(1.9)}/>'''
ICONS['sound-on'] = f'''<path d="M6 12.6h4.4L16 7.6v16.8l-5.6-5H6z" {fl(BLUE)}/>
<path d="M19.6 12.4a5 5 0 0 1 0 7.2M22.8 9.4a9.4 9.4 0 0 1 0 13.2" {st(1.8)}/>'''
ICONS['sound-off'] = f'''<path d="M6 12.6h4.4L16 7.6v16.8l-5.6-5H6z" {fl(GREY)}/>
<path d="M20.4 13.2l6 5.6M26.4 13.2l-6 5.6" {st(1.9)}/>'''
ICONS['home'] = f'''<path d="M4.6 15L16 5.4 27.4 15" {st(2.2)}/>
<path d="M7.6 13.4V26h16.8V13.4" {fl(CREAM)}/>
<rect x="13.2" y="18.4" width="5.6" height="7.6" rx="1" {fl(PINK,1.5)}/>'''
ICONS['door'] = f'''<rect x="7" y="4.6" width="18" height="22.8" rx="2.4" {fl(BRN)}/>
<circle cx="20.4" cy="16.4" r="1.5" fill="{YEL}" stroke="{INK}" stroke-width="1.2"/>'''
ICONS['backpack'] = f'''<path d="M7 12.4a9 9 0 0 1 18 0V25a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" {fl(PINK)}/>
<path d="M11.6 11.4a4.4 4.4 0 0 1 8.8 0" {st(1.8)}/>
<rect x="11.4" y="16.4" width="9.2" height="6.4" rx="1.6" {fl(CREAM,1.5)}/>'''
ICONS['books'] = f'''<rect x="4.6" y="8.6" width="5.4" height="17.4" rx="1.4" {fl(RED)}/>
<rect x="11.4" y="6.6" width="5.4" height="19.4" rx="1.4" {fl(YEL)}/>
<rect x="18.2" y="10.4" width="5.4" height="15.6" rx="1.4" {fl(BLUE)}/>
<path d="M3.4 26h25.2" {st(1.8)}/>'''
ICONS['trophy'] = f'''<path d="M10 5.4h12v7.2a6 6 0 0 1-12 0z" {fl(YEL)}/>
<path d="M10 8h-3.4a3.4 3.4 0 0 0 3.4 5M22 8h3.4a3.4 3.4 0 0 1-3.4 5" {st(1.8)}/>
<path d="M16 18.6V23M11.6 26.6h8.8" {st(2)}/>'''
ICONS['party'] = f'''<path d="M5.4 26.6L12 10.6l9.4 9.4z" {fl(PINK)}/>
<circle cx="24" cy="7.4" r="1.5" fill="{YEL}"/><circle cx="27" cy="14" r="1.3" fill="{BLUE}"/><circle cx="19.4" cy="5.6" r="1.2" fill="{GREEN}"/>
<path d="M23 19.4l2.6 2.6M26.6 8.6l2 -2" {st(1.5,PUR)}/>'''
ICONS['crown'] = f'''<path d="M4.6 22.4L6 9.4l6 5.4 4-8.4 4 8.4 6-5.4 1.4 13z" {fl(YEL)}/>
<path d="M4.6 25.4h22.8" {st(2)}/>
<circle cx="16" cy="18.4" r="1.4" fill="{RED}"/>'''
ICONS['tomato'] = f'''<path d="M16 8.4c5.4 0 9 3.6 9 8.6 0 5.2-4 8.8-9 8.8s-9-3.6-9-8.8c0-5 3.6-8.6 9-8.6z" {fl(RED)}/>
<path d="M16 9V5.6M16 7.4c-1.7-1.8-3.6-2-4.9-1.7.6 1.8 2.3 3 4.9 2.9zM16 7.4c1.7-1.8 3.6-2 4.9-1.7-.6 1.8-2.3 3-4.9 2.9z" {fl(GREEN,1.6)}/>
<path d="M11.4 14.6q1.6 2.4 3.4 1" {st(1.4,CREAM)} opacity=".8"/>'''
ICONS['egg'] = f'''<path d="M16 4.6c4.6 0 8 6.6 8 12 0 5.4-3.6 9-8 9s-8-3.6-8-9c0-5.4 3.4-12 8-12z" {fl(CREAM)}/>
<circle cx="13.6" cy="16.4" r="1" fill="{INK}"/><circle cx="18.4" cy="16.4" r="1" fill="{INK}"/>
<path d="M14.4 19.6q1.6 1.4 3.2 0" {st(1.5)}/>'''
ICONS['bread'] = f'''<path d="M6 13.4c0-4 4.4-6 10-6s10 2 10 6v10a2.6 2.6 0 0 1-2.6 2.6H8.6A2.6 2.6 0 0 1 6 23.4z" {fl(BRN)}/>
<path d="M9.4 13.6c0-2 3-3 6.6-3s6.6 1 6.6 3" {st(1.5,CREAM)}/>'''
ICONS['milk'] = f'''<path d="M11 4.6h10v3.8l2.4 4.6V26a1.4 1.4 0 0 1-1.4 1.4H10a1.4 1.4 0 0 1-1.4-1.4V13l2.4-4.6z" {fl(CREAM)}/>
<path d="M8.8 16.4h14.4" {st(1.6)}/><circle cx="16" cy="21" r="2.4" fill="{BLUE}" opacity=".55"/>'''
ICONS['butter'] = f'''<path d="M5.4 14.4l5-4.6h16.2v9.4l-5 4.6H5.4z" {fl(YEL)}/>
<path d="M5.4 14.4h16.2v9.4M21.6 14.4l5-4.6" {st(1.6)}/>'''
ICONS['pepper'] = f'''<path d="M18.4 8.6c4 1.6 6 5.6 4.4 10.2-1.6 4.6-6 7-9.8 5.8-3.4-1-4.6-4.6-2.6-7.2 2-2.6 5.6-2 6.6-5.2.4-1.4.6-2.6 1.4-3.6z" {fl(RED)}/>
<path d="M18.4 8.6c-.6-2 .4-3.6 2.4-4 .8 1.8.4 3.4-1 4.4" {fl(GREEN,1.5)}/>'''
ICONS['pan'] = f'''<ellipse cx="13.4" cy="17.6" rx="9" ry="6.6" {fl(GREY)}/>
<ellipse cx="13.4" cy="16.6" rx="6.4" ry="4.4" fill="{CREAM}"/>
<circle cx="13.4" cy="16.6" r="2.2" fill="{YEL}"/>
<path d="M22.4 17.6h6.2" {st(2.4,BRN)}/>'''
ICONS['coffee'] = f'''<path d="M6.4 10.4h16v9.4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" {fl(CREAM)}/>
<path d="M22.4 12.6h2.4a3.4 3.4 0 0 1 0 6.8h-2.4" {st(1.8)}/>
<path d="M11 6.4c-.8 1.2-.8 2 0 3.2M16.4 5.6c-.8 1.4-.8 2.4 0 4" {st(1.5,BLUE)} opacity=".8"/>
<path d="M9 14.4h10.6v4.6a3.6 3.6 0 0 1-3.6 3.6h-3.4A3.6 3.6 0 0 1 9 19z" fill="{BRN}"/>'''
ICONS['fire'] = f'''<path d="M16 4.4c1 4-2.6 5.4-2.6 8.6 0 1.4.8 2.4 2 2.4-2 1.6-3.4 3.8-3.4 6.4 0 3.4 2.8 5.6 6 5.6s6-2.2 6-5.6c0-6.4-6-9.6-8-17.4z" {fl(ORG)}/>
<path d="M16.6 17.8c1.6 1.4 2.4 3 2.4 4.4 0 1.6-1.2 2.6-2.8 2.6" {st(1.5,YEL)}/>'''
ICONS['water'] = f'''<path d="M16 4.6c4.4 6 8 9.8 8 13.8A8 8 0 0 1 8 18.4c0-4 3.6-7.8 8-13.8z" {fl(BLUE)}/>
<path d="M12.4 18.6a3.6 3.6 0 0 0 2.4 3.4" {st(1.5,CREAM)}/>'''
ICONS['rain'] = f'''<path d="M9.4 15.4a5.4 5.4 0 0 1 .8-10.6 6.4 6.4 0 0 1 12 1.4 4.6 4.6 0 0 1-1 9.2z" {fl(CREAM)}/>
<path d="M10.4 19.4l-1.4 4M16 19.4l-1.4 4M21.6 19.4l-1.4 4" {st(1.9,BLUE)}/>'''
ICONS['cloud'] = f'''<path d="M9.4 23a6 6 0 0 1 .8-11.8 7 7 0 0 1 13.2 1.6A5.2 5.2 0 0 1 22.4 23z" {fl(CREAM)}/>'''
ICONS['sun'] = f'''<circle cx="16" cy="16" r="6.4" {fl(YEL)}/>
<path d="M16 4.4v3M16 24.6v3M4.4 16h3M24.6 16h3M8 8l2.1 2.1M21.9 21.9L24 24M24 8l-2.1 2.1M10.1 21.9L8 24" {st(1.9)}/>'''
ICONS['moon'] = f'''<path d="M22.4 19.6A9.6 9.6 0 0 1 11 6.4a10.4 10.4 0 1 0 13 13.6 9.6 9.6 0 0 1-1.6-.4z" {fl(PUR)}/>
<circle cx="24.4" cy="8" r="1.3" fill="{YEL}"/><circle cx="20.4" cy="4.6" r="1" fill="{YEL}"/>'''
ICONS['wave'] = f'''<path d="M3.6 12.4q3.2-3.4 6.4 0t6.4 0 6.4 0 5.6 0" {st(2.2,BLUE)}/>
<path d="M3.6 18q3.2-3.4 6.4 0t6.4 0 6.4 0 5.6 0" {st(2.2,BLUE)} opacity=".7"/>
<path d="M3.6 23.6q3.2-3.4 6.4 0t6.4 0 6.4 0 5.6 0" {st(2.2,BLUE)} opacity=".45"/>'''
ICONS['forest'] = f'''<path d="M10 22L4.6 22 10 5.4 15.4 22z" {fl(GREEN)}/>
<path d="M22 22l-5.4 0L22 8.4 27.4 22z" {fl(GRN_D)}/>
<path d="M8.6 22v4.6M20.6 22v4.6" {st(2,BRN)}/>'''
ICONS['leaf'] = f'''<path d="M25.4 6.6C15.4 5.4 6.6 10 6.6 18.6c0 3 1.6 5.6 4 6.8C13 18.4 18 13.4 25.4 6.6z" {fl(GREEN)}/>
<path d="M25.4 6.6C18.6 12.4 13.6 18 10.6 25.4" {st(1.5,GRN_D)}/>'''
ICONS['flower'] = f'''<circle cx="16" cy="9.6" r="4" fill="{PINK}" stroke="{INK}" stroke-width="1.5"/>
<circle cx="22.4" cy="14.4" r="4" fill="{PINK}" stroke="{INK}" stroke-width="1.5"/>
<circle cx="20" cy="21.6" r="4" fill="{PINK}" stroke="{INK}" stroke-width="1.5"/>
<circle cx="12" cy="21.6" r="4" fill="{PINK}" stroke="{INK}" stroke-width="1.5"/>
<circle cx="9.6" cy="14.4" r="4" fill="{PINK}" stroke="{INK}" stroke-width="1.5"/>
<circle cx="16" cy="16" r="3.2" fill="{YEL}" stroke="{INK}" stroke-width="1.5"/>'''
ICONS['clover'] = f'''<circle cx="11.4" cy="11.4" r="4.4" {fl(GREEN,1.5)}/><circle cx="20.6" cy="11.4" r="4.4" {fl(GREEN,1.5)}/>
<circle cx="11.4" cy="20" r="4.4" {fl(GREEN,1.5)}/><circle cx="20.6" cy="20" r="4.4" {fl(GREEN,1.5)}/>
<path d="M16 16v11" {st(1.8,GRN_D)}/>'''
ICONS['seed'] = f'''<ellipse cx="16" cy="17.4" rx="7" ry="8.6" {fl(BRN)}/>
<path d="M12.4 13.4q3.6 4 7.2 8" {st(1.5,CREAM)} opacity=".7"/>
<path d="M16 8.8V6" {st(1.8,GRN_D)}/>'''
ICONS['rainbow'] = f'''<path d="M4 24a12 12 0 0 1 24 0" {st(2.6,RED)}/>
<path d="M7.4 24a8.6 8.6 0 0 1 17.2 0" {st(2.6,YEL)}/>
<path d="M10.8 24a5.2 5.2 0 0 1 10.4 0" {st(2.6,BLUE)}/>'''
ICONS['star'] = f'''<path d="M16 4.4l3.5 7.4 8 1.1-5.8 5.7 1.4 8-7.1-3.9-7.1 3.9 1.4-8-5.8-5.7 8-1.1z" {fl(YEL)}/>'''
ICONS['sparkle'] = f'''<path d="M16 4.4c.8 5.4 2.8 7.4 8.2 8.2-5.4.8-7.4 2.8-8.2 8.2-.8-5.4-2.8-7.4-8.2-8.2 5.4-.8 7.4-2.8 8.2-8.2z" {fl(YEL)}/>
<path d="M24.4 20c.4 2.6 1.4 3.6 4 4-2.6.4-3.6 1.4-4 4-.4-2.6-1.4-3.6-4-4 2.6-.4 3.6-1.4 4-4z" {fl(PINK,1.3)}/>'''
ICONS['heart'] = f'''<path d="M16 26.4S4.6 19.6 4.6 12.4A6 6 0 0 1 16 9.4a6 6 0 0 1 11.4 3c0 7.2-11.4 14-11.4 14z" {fl(PINK)}/>'''
ICONS['hearts'] = f'''<path d="M12 24S3.6 18.8 3.6 13.6a4.6 4.6 0 0 1 8.4-2.4 4.6 4.6 0 0 1 8.4 2.4C20.4 18.8 12 24 12 24z" {fl(PINK)}/>
<path d="M23.4 13.4s-4.6-2.8-4.6-5.6a2.6 2.6 0 0 1 4.6-1.4 2.6 2.6 0 0 1 4.6 1.4c0 2.8-4.6 5.6-4.6 5.6z" {fl(RED,1.4)}/>'''
ICONS['bolt'] = f'''<path d="M18.4 3.4L8 17.6h6.4L13.6 28.6 24 14.4h-6.4z" {fl(YEL)}/>'''
ICONS['spiral'] = f'''<path d="M16 16a3 3 0 1 1 3 3 5.4 5.4 0 1 1-5.4-5.4 8 8 0 1 1-8 8" {st(2.2,PUR)}/>'''
ICONS['tea'] = f'''<path d="M7 11.4h14v8a7 7 0 0 1-14 0z" {fl(GREEN)}/>
<path d="M21 13.6h2.6a3 3 0 0 1 0 6H21" {st(1.8)}/>
<path d="M11 7c-.7 1.2-.7 2 0 3.2M16.4 6.4c-.7 1.2-.7 2 0 3.2" {st(1.5)} opacity=".7"/>
<path d="M7 25.4h14" {st(1.9)}/>'''
ICONS['printer'] = f'''<rect x="8" y="4.6" width="16" height="7" rx="1.4" {fl(CREAM)}/>
<rect x="4.4" y="11.4" width="23.2" height="10.4" rx="2.4" {fl(BLUE)}/>
<rect x="8" y="19" width="16" height="8.4" rx="1.4" {fl(CREAM)}/>
<circle cx="23.4" cy="15.4" r="1.2" fill="{RED}"/>
<path d="M11 22.6h10M11 25h7" {st(1.3)}/>'''
ICONS['robot'] = f'''<rect x="5.6" y="9.4" width="20.8" height="15.6" rx="4" {fl(BLUE)}/>
<circle cx="12" cy="16" r="2.2" fill="{CREAM}" stroke="{INK}" stroke-width="1.4"/>
<circle cx="20" cy="16" r="2.2" fill="{CREAM}" stroke="{INK}" stroke-width="1.4"/>
<path d="M13 21h6" {st(1.6)}/><path d="M16 9.4V5.4M16 4.4a1.4 1.4 0 1 1 0 .1z" {st(1.8)}/>
<path d="M3.4 15v4M28.6 15v4" {st(2)}/>'''
ICONS['glasses'] = f'''<circle cx="9.4" cy="17" r="5" {fl(CREAM)}/><circle cx="22.6" cy="17" r="5" {fl(CREAM)}/>
<path d="M14.4 16.4q1.6-1.4 3.2 0M4.4 15l-1.4-2.4M27.6 15l1.4-2.4" {st(1.8)}/>'''
ICONS['sunglasses'] = f'''<path d="M4.4 12.6h9.4v4.8a3.4 3.4 0 0 1-3.4 3.4H7.8a3.4 3.4 0 0 1-3.4-3.4z" {fl(INK,1.4)}/>
<path d="M18.2 12.6h9.4v4.8a3.4 3.4 0 0 1-3.4 3.4h-2.6a3.4 3.4 0 0 1-3.4-3.4z" {fl(INK,1.4)}/>
<path d="M13.8 13.8q2.2-1 4.4 0M4.4 12.6L2.6 10M27.6 12.6L29.4 10" {st(1.8)}/>'''
ICONS['hat'] = f'''<path d="M10.4 5.4h11.2v11H10.4z" {fl(INK,1.5)}/>
<path d="M3.6 16.4h24.8v2.6a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" {fl(INK,1.5)}/>
<path d="M10.4 13h11.2" {st(1.6,RED)}/>'''
ICONS['ribbon'] = f'''<path d="M16 13.4c-3.4-4.6-9.4-4-9.4 0 0 3.4 5.4 4 9.4 0zM16 13.4c3.4-4.6 9.4-4 9.4 0 0 3.4-5.4 4-9.4 0z" {fl(PINK)}/>
<circle cx="16" cy="13.4" r="2.4" {fl(RED,1.4)}/>
<path d="M13.4 15.6L10 26M18.6 15.6L22 26" {st(2,PINK)}/>'''
ICONS['headphone'] = f'''<path d="M6 20v-4a10 10 0 0 1 20 0v4" {st(2.2)}/>
<rect x="3.4" y="18.4" width="5.6" height="8.4" rx="2.6" {fl(PINK)}/>
<rect x="23" y="18.4" width="5.6" height="8.4" rx="2.6" {fl(PINK)}/>'''
ICONS['mic'] = f'''<rect x="12.4" y="4.4" width="7.2" height="13.6" rx="3.6" {fl(PINK)}/>
<path d="M7.6 15.4a8.4 8.4 0 0 0 16.8 0M16 23.8v3.6M12 27.4h8" {st(2)}/>'''
ICONS['person'] = f'''<circle cx="16" cy="10.4" r="5" {fl(CREAM)}/>
<path d="M6.4 27a9.6 9.6 0 0 1 19.2 0z" {fl(BLUE)}/>'''
ICONS['people'] = f'''<circle cx="11" cy="11" r="4.4" {fl(CREAM)}/>
<circle cx="21.6" cy="12.4" r="3.6" {fl(CREAM)}/>
<path d="M3.6 25.4a7.4 7.4 0 0 1 14.8 0z" {fl(PINK)}/>
<path d="M17.6 25.4a5.6 5.6 0 0 1 10.8-.6" {fl(BLUE)}/>'''
ICONS['handshake'] = f'''<path d="M3.4 14.4l5-3.4 6 3.4 4-1 4 1 6-3.4 5 3.4v6l-4 4-6-4h-4l-4 4-6-4-6-1z" {fl(CREAM)}/>
<path d="M14.4 14.4l4 4" {st(1.6)}/>'''
ICONS['wave-hand'] = f'''<path d="M10.4 26c-3.6-2.6-5-6.4-5-10.4V9.4a1.8 1.8 0 0 1 3.6 0v4.2V6.4a1.9 1.9 0 0 1 3.8 0v7V5.6a1.9 1.9 0 0 1 3.8 0v7.8V8a1.8 1.8 0 0 1 3.6 0v9.4c0 4.6-2.4 8.6-6 8.6z" {fl(CREAM)}/>
<path d="M23 6l2.6-2M25.4 11.4l3.2-.6" {st(1.5,YEL)}/>'''
ICONS['run'] = f'''<circle cx="19.4" cy="6.4" r="3" {fl(CREAM)}/>
<path d="M17 11.4l-4.4 4 3 3.6-2 7.6M15.6 19l6 1.4 2.4 5.6M12.6 15.4L6.4 17.4" {st(2.2)}/>'''
ICONS['muscle'] = f'''<path d="M4.6 20c0-5 3.6-8.6 8.6-8.6 3 0 4.6 1.4 6 3.4 1.4-2 3.4-3.4 6-3 3.4.6 4.6 3.6 4 6.6-.8 4-4.6 7-9.4 7H9a4.4 4.4 0 0 1-4.4-5.4z" {fl(CREAM)}/>
<path d="M13.4 15.6q2.4 2.6 5 1" {st(1.6)}/>'''
ICONS['eyes'] = f'''<ellipse cx="10.4" cy="16" rx="6.4" ry="5" {fl(CREAM)}/>
<ellipse cx="21.6" cy="16" rx="6.4" ry="5" {fl(CREAM)}/>
<circle cx="10.4" cy="16" r="2.2" fill="{INK}"/><circle cx="21.6" cy="16" r="2.2" fill="{INK}"/>'''
ICONS['hand-stop'] = f'''<path d="M8.4 24c-2-3-2.4-5.6-2.4-8.6V8.4a1.9 1.9 0 0 1 3.8 0v6V5.4a1.9 1.9 0 0 1 3.8 0v8.6V4.6a1.9 1.9 0 0 1 3.8 0v9.4V7.4a1.9 1.9 0 0 1 3.8 0v10.4c0 5-2.6 9-7 9-3 0-5.4-1.2-5.8-2.8z" {fl(CREAM)}/>'''
ICONS['shrug'] = f'''<circle cx="16" cy="8.4" r="4" {fl(CREAM)}/>
<path d="M8 24c0-4.4 3.6-8 8-8s8 3.6 8 8" {st(2.2)}/>
<path d="M6.4 15.4L3.4 20M25.6 15.4L28.6 20" {st(2)}/>'''
ICONS['map'] = f'''<path d="M4 8.4l7.4-3 9.2 3 7.4-3v18.2l-7.4 3-9.2-3-7.4 3z" {fl(CREAM)}/>
<path d="M11.4 5.4v18.2M20.6 8.4v18.2" {st(1.6)}/>
<circle cx="16" cy="14.4" r="1.8" fill="{RED}"/>'''
ICONS['mountain'] = f'''<path d="M2.6 25.4L11 9.4l5.4 9.6L20 13l9.4 12.4z" {fl(GREY)}/>
<path d="M8.4 14.4l2.6-5 2.8 5-2.8 1.4z" fill="{CREAM}"/>
<path d="M17.6 17.4L20 13l2.6 4.4-2.6 1z" fill="{CREAM}"/>'''
ICONS['house-small'] = f'''<path d="M5.4 15.4L16 6.4l10.6 9" {st(2.2)}/>
<path d="M8 14v11.6h16V14" {fl(PINK)}/>
<rect x="13.4" y="18.6" width="5.2" height="7" rx="1" {fl(CREAM,1.4)}/>'''
ICONS['sunrise'] = f'''<circle cx="16" cy="17.4" r="5.4" {fl(YEL)}/>
<path d="M3.6 23.4h24.8" {st(2.2)}/>
<path d="M16 6.4v3M6.6 10.6l2.1 2.1M25.4 10.6l-2.1 2.1M3.6 19h3M25.4 19h3" {st(1.8)}/>'''
ICONS['card'] = f'''<rect x="7" y="4.6" width="18" height="22.8" rx="2.6" {fl(PUR)}/>
<path d="M16 9.4l2.4 5 5.4.6-4 3.6 1.2 5.4-5-2.8-5 2.8 1.2-5.4-4-3.6 5.4-.6z" {fl(YEL,1.3)}/>'''
ICONS['flask'] = f'''<path d="M13.4 4.6h5.2v8l6.4 11.4a2.4 2.4 0 0 1-2.1 3.6H9.1a2.4 2.4 0 0 1-2.1-3.6L13.4 12.6z" {fl(CREAM)}/>
<path d="M10.4 19.4h11.2l3 5.4a1.4 1.4 0 0 1-1.2 2.2H8.6a1.4 1.4 0 0 1-1.2-2.2z" fill="{PUR}"/>
<path d="M12 4.6h8" {st(2)}/>'''
ICONS['microscope'] = f'''<path d="M16.4 6.4l5 5-5.4 5.4-5-5z" {fl(BLUE)}/>
<path d="M13.4 16.4l4.4 4.4M9.4 26.6h16M11.4 26.6c0-5 3-8.6 7-9.4" {st(2.2)}/>'''
ICONS['sword'] = f'''<path d="M25.4 4.6l-13 13 2.6 2.6 13-13z" {fl(GREY)}/>
<path d="M9.4 20.4l-3.4 5.4 5.4-3.4M9.4 15.4l-2 2 5 5 2-2" {st(1.9)}/>'''
ICONS['eagle'] = f'''<path d="M16 10.4c4-4.6 10-5 14 0-3.6 1.4-4.6 4-4.6 7-3-1.6-6.4-1.4-9.4 1.4-3-2.8-6.4-3-9.4-1.4 0-3-1-5.6-4.6-7 4-5 10-4.6 14 0z" {fl(BRN)}/>
<path d="M16 18.8v6M13.4 24.4h5.2" {st(2,YEL)}/>'''
ICONS['tarot'] = f'''<rect x="4.4" y="6" width="14" height="20" rx="2.2" transform="rotate(-8 11.4 16)" {fl(CREAM)}/>
<rect x="13.6" y="6" width="14" height="20" rx="2.2" transform="rotate(8 20.6 16)" {fl(PUR)}/>
<path d="M20.6 12.4l1.4 3 3.2.4-2.4 2.2.7 3.2-2.9-1.6-2.9 1.6.7-3.2-2.4-2.2 3.2-.4z" fill="{YEL}"/>'''
ICONS['trigram'] = f'''<path d="M6.4 9h19.2M6.4 16h19.2M6.4 23h19.2" {st(2.6,PUR)}/>'''
ICONS['post'] = f'''<rect x="4.4" y="7" width="23.2" height="18" rx="2.6" {fl(CREAM)}/>
<path d="M4.8 8.4L16 17.4 27.2 8.4" {st(1.8)}/>
<path d="M9.4 20.6h6" {st(1.4)} opacity=".6"/>'''
ICONS['photo-frame'] = f'''<rect x="4.4" y="5.4" width="23.2" height="21.2" rx="2.6" {fl(BRN)}/>
<rect x="8" y="9" width="16" height="14" rx="1.4" fill="{CREAM}"/>
<circle cx="12.4" cy="13.4" r="1.6" fill="{YEL}"/>
<path d="M8.4 20.4l4.6-4.4 3.4 3.2 3-2.6 4.2 3.8" {st(1.5,GREEN)}/>'''

ICONS['peace'] = f'''<path d="M11.4 26.4c-2.6-4.4-3.4-9-2.4-13.6a2 2 0 0 1 3.8 1l1 4.4 1.4-9.6a2 2 0 0 1 4 .6l-.4 8 2-8.2a2 2 0 0 1 3.9 1l-1.6 7.8c-.8 4-2.2 7.2-4 10z" {fl(CREAM)}/>'''

# 别名（多 emoji 映射到同一图标）
ALIAS = {
  'face-worried': 'face-scared', 'face-tired': 'face-sleep',
}
for a, b in ALIAS.items():
    ICONS[a] = ICONS[b]

# ───────────────────────── 输出 ─────────────────────────
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(root, 'src', 'icons')
os.makedirs(out_dir, exist_ok=True)

ts = ["// 自动生成，请勿手改 —— 见 tools/gen_icons.py",
      "// TOMO 手绘图标系统：深棕墨线 + 低饱和粉彩",
      "export const TOMO_ICONS: Record<string, string> = {"]
for name in sorted(ICONS):
    body = ICONS[name].replace('\n', '')
    ts.append(f"  {json.dumps(name)}: {json.dumps(body)},")
ts.append("}")
ts.append("")
ts.append("export type TomoIconName = keyof typeof TOMO_ICONS")
open(os.path.join(out_dir, 'tomoIcons.ts'), 'w', encoding='utf-8').write('\n'.join(ts))

# 单张 SVG 文件（便于云盘交付 / 预览）
svg_dir = os.path.join(root, 'public', 'icons')
os.makedirs(svg_dir, exist_ok=True)
for name, body in ICONS.items():
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">'
           f'<rect width="32" height="32" fill="none"/>{body}</svg>')
    open(os.path.join(svg_dir, f'{name}.svg'), 'w', encoding='utf-8').write(svg)

print(f'icons: {len(ICONS)}  ->  src/icons/tomoIcons.ts + public/icons/*.svg')
