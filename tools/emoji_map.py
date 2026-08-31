#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""emoji -> TOMO 图标名 全量映射"""

MAP = {
    # 表情
    '😊':'face-happy','🙂':'face-happy','😀':'face-laugh','😄':'face-laugh','😁':'face-laugh',
    '😂':'face-laugh','🤣':'face-laugh','😆':'face-laugh','😃':'face-laugh',
    '😌':'face-calm','😇':'face-calm','🙃':'face-calm',
    '😭':'face-cry','😢':'face-sad','🥲':'face-sad','😔':'face-sad','🙁':'face-sad','☹':'face-sad',
    '😠':'face-angry','😡':'face-angry','🤬':'face-angry','😤':'face-mad',
    '🤔':'face-think','🧐':'face-think','😕':'face-think',
    '😳':'face-shy','😅':'face-shy','🥺':'face-shy','😶':'face-blank',
    '😲':'face-shock','😮':'face-shock','🤯':'face-shock','😱':'face-shock',
    '😐':'face-flat','😑':'face-flat','😒':'face-smug','😏':'face-smug',
    '😎':'face-cool','🤒':'face-sick','🤢':'face-sick','🤕':'face-sick',
    '😴':'face-sleep','💤':'face-sleep','🥱':'face-sleep',
    '😍':'face-love','🥰':'face-love','😘':'face-love',
    '😨':'face-scared','😰':'face-scared','😟':'face-scared','😧':'face-scared',
    '😺':'face-cat','😸':'face-cat','😻':'face-cat','😹':'face-cat',
    '😉':'face-wink','🥶':'face-cold','🤗':'face-happy','😋':'face-happy',
    '🙈':'face-peek','🤷':'shrug','🏃':'run','💪':'muscle','👀':'eyes','👋':'wave-hand','✋':'hand-stop',
    '🤝':'handshake','👥':'people','👨':'person','🧑':'person','👤':'person',

    # 功能 / 对象
    '🍅':'tomato','🥚':'egg','🍞':'bread','🥛':'milk','🧈':'butter','🌶':'pepper','🍳':'pan',
    '☕':'coffee','🍵':'tea','🍸':'cocktail','🔥':'fire','💧':'water','🌊':'wave','🌧':'rain',
    '☁':'cloud','☀':'sun','🌙':'moon','🌅':'sunrise','🌈':'rainbow','⚡':'bolt','🌀':'spiral',
    '🌱':'sprout','🌿':'leaf','🌳':'tree','🌲':'forest','🌸':'flower','🌼':'flower','🍀':'clover','🌰':'seed',
    '📖':'book','📚':'books','🎨':'palette','🏞':'scene','🔮':'crystal','🎭':'mask','🎁':'gift',
    '🏆':'trophy','🎉':'party','👑':'crown','🃏':'tarot','⭐':'star','✨':'sparkle',
    '♥':'heart','❤':'heart','💕':'hearts','💖':'hearts','♡':'heart',
    '🎒':'backpack','🎩':'hat','🎀':'ribbon','👓':'glasses','🕶':'sunglasses','🎧':'headphone','🎤':'mic',
    '🏠':'home','🏡':'house-small','🚪':'door','🗺':'map','🏔':'mountain',
    '🧪':'flask','🔬':'microscope','🤖':'robot','🖨':'printer','📷':'camera','📸':'camera',
    '🖼':'photo-frame','💡':'idea','🔑':'key','🔓':'lock-open','🔊':'sound-on','🔇':'sound-off',
    '🔄':'refresh','✅':'check','✓':'check','⚔':'sword','🦅':'eagle',

    # 符号
    '→':'arrow-right','←':'arrow-left','↓':'arrow-down','✕':'close','✖':'close','×':'close',
}

# 保留为文字符号（易经卦象 / 星级 / 装饰），不替换
KEEP = set('★☆✦✿✾☰☱☲☳☴☵☶☷☾🜁🜃♂♀')
