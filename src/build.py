import os,re
parts=['shell_head.html','poses_old.js','poses_new.js','days_old.js','alt_old.js','var_old.js','swaps_old.js','cplans.js','data_new.js','app.js']
src={p:open(p).read() for p in parts}
def make(standalone):
    out=''
    for p in parts:
        t=src[p]
        if p=='shell_head.html':
            head=('<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n<link rel="icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="apple-mobile-web-app-title" content="Training">' if standalone else '')
            t=t.replace('<!--PWA-HEAD-->',head)
            if standalone: t=t.replace("<title>Ben's Training</title>","<title>Training</title>")
            t+='const STANDALONE='+('true' if standalone else 'false')+';\n'
        if p=='app.js' and standalone:
            t=re.sub(r'/\*SYNC-START\*/.*?/\*SYNC-END\*/',lambda m:open('standalone_tail.js').read(),t,flags=re.S)
        out+=t+'\n'
    return out+'</script>\n</body>\n</html>\n'
open('/mnt/user-data/outputs/gym-plan.html','w').write(make(False))
os.makedirs('/mnt/user-data/outputs/training-app',exist_ok=True)
open('/mnt/user-data/outputs/training-app/index.html','w').write(make(True))
print('built')
