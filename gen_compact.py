from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
prs=Presentation()
prs.slide_width=Inches(13.33); prs.slide_height=Inches(7.5)
NAVY=RGBColor(0x07,0x1E,0x33); TEAL=RGBColor(0x00,0xE5,0xCC); WHITE=RGBColor(0xFF,0xFF,0xFF)
BG=RGBColor(0xF8,0xFA,0xFC); GRAY=RGBColor(0xF1,0xF5,0xF9); MID=RGBColor(0x47,0x5C,0x7A); BD=RGBColor(0xE2,0xE8,0xF0)
GREEN=RGBColor(0x10,0xB9,0x81)
def bg(s,c):
    s.background.fill.solid(); s.background.fill.fore_color.rgb=c
def tx(s,l,t,w,h,txt,sz=10,b=False,cl=NAVY,al=PP_ALIGN.LEFT,ls=Pt(12)):
    x=s.shapes.add_textbox(l,t,w,h)
    tf=x.text_frame; tf.word_wrap=True
    p=tf.paragraphs[0]; p.text=txt; p.font.size=Pt(sz); p.font.bold=b; p.font.color.rgb=cl; p.alignment=al; p.line_spacing=ls
    return x
def add_table(s, l,t,w,h, data, col_w=None, hdr=True):
    tbl=s.shapes.add_table(len(data), len(data[0]), l,t,w,h).table
    if col_w:
        for i,ww in enumerate(col_w): tbl.columns[i].width=ww
    for r,row in enumerate(data):
        for c,val in enumerate(row):
            cell=tbl.cell(r,c)
            cell.text=val
            for para in cell.text_frame.paragraphs:
                para.alignment=PP_ALIGN.CENTER
                para.font.size=Pt(6)
                para.font.bold=(r==0 and hdr)
                para.font.color.rgb=WHITE if r==0 else NAVY
            cell.vertical_anchor=1
            if r==0: cell.fill.solid(); cell.fill.fore_color.rgb=NAVY
            elif r%2==0: cell.fill.solid(); cell.fill.fore_color.rgb=GRAY
            else: cell.fill.solid(); cell.fill.fore_color.rgb=WHITE
            cell.margin_top=Pt(1); cell.margin_bottom=Pt(1)
    return tbl
# S1 Cover
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,NAVY)
tx(s,Inches(0.6),Inches(0.7),Inches(8),Inches(0.3),"V2Power",10,True,TEAL)
tx(s,Inches(0.6),Inches(1.05),Inches(8.5),Inches(0.85),"Voucher Redeem Website",30,True,WHITE,PP_ALIGN.LEFT,Pt(32))
tx(s,Inches(0.6),Inches(1.9),Inches(9),Inches(0.3),"Requirements / Interaction / Implementation  |  2026-08-25  |  coupon.v2power.com /coupon/",10,False,RGBColor(0xC0,0xD0,0xE6))
for i,(k,v) in enumerate([("PRD v1.2","9 feedbacks merged"),("IA v1.2","P0-P4 loop"),("Frontend","Vite+React demo"),("Backend API v6","integrated")]):
    x=Inches(0.6+i*2.45)
    sh=s.shapes.add_shape(1,x,Inches(3.0),Inches(2.25),Inches(0.55))
    sh.fill.solid(); sh.fill.fore_color.rgb=RGBColor(0x0E,0x2E,0x4F); sh.line.fill.background()
    tx(s,x+Inches(0.1),Inches(3.05),Inches(2.05),Inches(0.15),k,7,True,TEAL)
    tx(s,x+Inches(0.1),Inches(3.25),Inches(2.05),Inches(0.2),v,7,False,WHITE)
sh=s.shapes.add_shape(1,Inches(9.2),Inches(0.6),Inches(3.5),Inches(4.4))
sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.fill.background()
tx(s,Inches(9.45),Inches(0.8),Inches(3),Inches(0.2),"SUMMARY",7,True,RGBColor(0x0A,0x7A,0x6E))
tx(s,Inches(9.45),Inches(1.05),Inches(3),Inches(0.25),"Demo-ready today",10,True,NAVY)
for i,t in enumerate(["?t= auto-fill Token, trim+uppercase","Single Email + GDPR + reCAPTCHA ticket","Overlay 15s, history.state masked","Help/Privacy/WA, none vs recaptcha"]):
    tx(s,Inches(9.55),Inches(1.45+i*0.45),Inches(3),Inches(0.4),"- "+t,7,False,MID,PP_ALIGN.LEFT,Pt(9))
tx(s,Inches(0.6),Inches(6.95),Inches(6),Inches(0.2),"V2Power Confidential | Internal",6,False,RGBColor(0x8A,0xA2,0xBE))
# S2 Agenda
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,BG)
sh=s.shapes.add_shape(1,Inches(0),Inches(0),Inches(13.33),Inches(0.6)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(0.6),Inches(0.2),Inches(8),Inches(0.3),"AGENDA  |  7 slides compact (Part 5 removed)",11,True,WHITE)
for i,(n,tt,d) in enumerate([("01","Background","Why Token indirection"),("02","PRD","v1.2 scope/roles/metrics"),("03","IA","P0-P4 + matrix"),("04","Implementation","Backend 12 + Frontend 9")]):
    x=Inches(0.6+i*3.15)
    sh=s.shapes.add_shape(1,x,Inches(1.0),Inches(2.95),Inches(1.9)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
    tx(s,x+Inches(0.15),Inches(1.15),Inches(0.4),Inches(0.2),n,7,True,TEAL,PP_ALIGN.CENTER)
    tx(s,x+Inches(0.6),Inches(1.15),Inches(2.1),Inches(0.2),tt,10,True,NAVY)
    tx(s,x+Inches(0.15),Inches(1.45),Inches(2.65),Inches(0.8),d,7,False,MID)
tx(s,Inches(0.6),Inches(3.3),Inches(12),Inches(0.2),"Order: Background -> PRD -> IA -> Implementation + Live Demo (localhost / ?t=)",7,False,RGBColor(0x94,0xA3,0xB8),PP_ALIGN.CENTER)
sh=s.shapes.add_shape(1,Inches(0.5),Inches(3.7),Inches(12.33),Inches(2.8)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(0.7),Inches(3.85),Inches(4),Inches(0.2),"Coverage",9,True,NAVY)
for i,(h,d,st) in enumerate([("PRD","Scope/Terms/Roles/Flows","v1.2 done"),("IA","Sitemap/Pages/Flows/Matrix","v1.2 done"),("API v6","import/redeem/qr/batch/captcha","aligned"),("Deliverables","Docs + Vite + dist.zip","ready")]):
    x=Inches(0.7+i*3.0)
    sh=s.shapes.add_shape(1,x,Inches(4.25),Inches(2.85),Inches(1.95)); sh.fill.solid(); sh.fill.fore_color.rgb=GRAY; sh.line.fill.background()
    tx(s,x+Inches(0.1),Inches(4.35),Inches(2.65),Inches(0.2),h,7,True,NAVY)
    tx(s,x+Inches(0.1),Inches(4.6),Inches(2.65),Inches(0.6),d,7,False,MID,PP_ALIGN.LEFT,Pt(9))
    tx(s,x+Inches(0.1),Inches(5.85),Inches(2.65),Inches(0.15),st,7,True,GREEN)
# S3 Background
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,BG)
sh=s.shapes.add_shape(1,Inches(0),Inches(0),Inches(13.33),Inches(0.6)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(0.6),Inches(0.2),Inches(8),Inches(0.3),"01  BACKGROUND  |  Why redeem site",11,True,WHITE)
sh=s.shapes.add_shape(1,Inches(0.5),Inches(1.0),Inches(4.1),Inches(5.8)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(0.7),Inches(1.15),Inches(3.7),Inches(0.2),"Pain points",9,True,NAVY)
for i,t in enumerate(["Voucher printed directly -> leak/screenshot","No traceability of ownership","Bots can brute-force tokens","No unified entry, triage hard"]):
    tx(s,Inches(0.75),Inches(1.5+i*0.3),Inches(3.7),Inches(0.25),"- "+t,7,False,MID)
sh2=s.shapes.add_shape(1,Inches(0.7),Inches(2.9),Inches(3.7),Pt(1)); sh2.fill.solid(); sh2.fill.fore_color.rgb=BD; sh2.line.fill.background()
tx(s,Inches(0.7),Inches(3.1),Inches(3.7),Inches(0.2),"Solution: Token indirection",9,True,NAVY)
for i,t in enumerate(["Voucher <-> Token 1:1, backend generated","Print only Token (QR + text + branding)","Real voucher only via email, never frontend","Token one-time, unpredictable, revocable"]):
    tx(s,Inches(0.75),Inches(3.4+i*0.3),Inches(3.7),Inches(0.25),"- "+t,7,False,MID)
sh=s.shapes.add_shape(1,Inches(4.85),Inches(1.0),Inches(4.2),Inches(5.8)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(5.05),Inches(1.15),Inches(3.8),Inches(0.2),"6-step loop",9,True,NAVY)
steps=[("1 Ops","Import -> Token"),("2 Print","QR + text"),("3 User","Scan ?t="),("4 Redeem","Email+verify"),("5 System","Validate+email"),("6 Done","APP wallet")]
for i,(a,b) in enumerate(steps):
    x=Inches(5.05+(i%3)*1.33); y=Inches(1.5+(0 if i<3 else 2.0))
    sh=s.shapes.add_shape(1,x,y,Inches(1.2),Inches(1.4)); sh.fill.solid(); sh.fill.fore_color.rgb=GRAY; sh.line.fill.background()
    tx(s,x, y+Inches(0.1),Inches(1.2),Inches(0.3),a,7,True,NAVY,PP_ALIGN.CENTER)
    tx(s,x, y+Inches(0.6),Inches(1.2),Inches(0.4),b,6,False,MID,PP_ALIGN.CENTER,Pt(8))
sh=s.shapes.add_shape(1,Inches(9.4),Inches(1.0),Inches(3.43),Inches(5.8)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(9.6),Inches(1.15),Inches(3),Inches(0.2),"Metrics",9,True,WHITE)
for i,(v,k,d) in enumerate([(">=98%","Success","valid->email"),("<=60s","P95 email","SMTP async"),("<=0.5%","Bot FP","fallback"),("~0","Brute-force","80bits+limit")]):
    y=Inches(1.6+i*0.95)
    sh=s.shapes.add_shape(1,Inches(9.6),y,Inches(3.03),Inches(0.8)); sh.fill.solid(); sh.fill.fore_color.rgb=RGBColor(0x0E,0x2E,0x4F); sh.line.fill.background()
    tx(s,Inches(9.7),y+Inches(0.15),Inches(1),Inches(0.25),v,10,True,TEAL)
    tx(s,Inches(10.8),y+Inches(0.1),Inches(1.5),Inches(0.2),k,7,True,WHITE,PP_ALIGN.LEFT)
    tx(s,Inches(10.8),y+Inches(0.3),Inches(1.5),Inches(0.25),d,6,False,RGBColor(0x8A,0xA2,0xBE),PP_ALIGN.LEFT)
# S4 PRD
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,BG)
sh=s.shapes.add_shape(1,Inches(0),Inches(0),Inches(13.33),Inches(0.6)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(0.6),Inches(0.2),Inches(9),Inches(0.3),"02  PRD v1.2  |  9 feedbacks merged",11,True,WHITE)
sh=s.shapes.add_shape(1,Inches(0.5),Inches(0.9),Inches(4.1),Inches(5.3)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(0.65),Inches(1.0),Inches(3.8),Inches(0.2),"Scope & Roles",9,True,NAVY)
tx(s,Inches(0.65),Inches(1.35),Inches(3.8),Inches(0.15),"In scope",7,True,NAVY)
for i,t in enumerate(["Token/Voucher mapping (backend)","Redeem H5/PC frontend","Backend validate + email","Template & stats"]):
    tx(s,Inches(0.7),Inches(1.55+i*0.25),Inches(3.7),Inches(0.2),"- "+t,7,False,MID)
tx(s,Inches(0.65),Inches(2.7),Inches(3.8),Inches(0.15),"Out of scope",7,True,MID)
for i,t in enumerate(["APP wallet (done)","Payment/refund","Print design (QR spec only)"]):
    tx(s,Inches(0.7),Inches(2.9+i*0.22),Inches(3.7),Inches(0.2),"- "+t,7,False,RGBColor(0x94,0xA3,0xB8))
tx(s,Inches(0.65),Inches(3.75),Inches(3.8),Inches(0.15),"Roles",7,True,NAVY)
for i,(a,b) in enumerate([("Visitor","Redeem + email"),("Ops","Gen/query/revoke/resend"),("Admin","Limit + audit")]):
    y=Inches(4.0+i*0.4)
    sh=s.shapes.add_shape(1,Inches(0.65),y,Inches(3.8),Inches(0.32)); sh.fill.solid(); sh.fill.fore_color.rgb=GRAY; sh.line.fill.background()
    tx(s,Inches(0.7),y+Inches(0.05),Inches(1.1),Inches(0.22),a,7,True,NAVY)
    tx(s,Inches(1.9),y+Inches(0.05),Inches(2.5),Inches(0.22),b,7,False,MID)
sh=s.shapes.add_shape(1,Inches(4.85),Inches(0.9),Inches(4.0),Inches(5.3)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(5.0),Inches(1.0),Inches(3.7),Inches(0.2),"Core requirements",9,True,NAVY)
for i,(a,b) in enumerate([("US-01 Redeem","Scan -> Email+Token -> email -> APP"),("US-02 Errors","Invalid/used/expired with guidance"),("US-03 Ops","Batch import Token + QR export"),("US-04 Audit","Query + revoke + resend limit"),("US-05 Security","Anti-bot + GDPR consent block")]):
    y=Inches(1.3+i*0.58)
    sh=s.shapes.add_shape(1,Inches(5.0),y,Inches(3.7),Inches(0.48)); sh.fill.solid(); sh.fill.fore_color.rgb=GRAY; sh.line.fill.background()
    tx(s,Inches(5.1),y+Inches(0.05),Inches(3.5),Inches(0.15),a,6,True,NAVY)
    tx(s,Inches(5.1),y+Inches(0.22),Inches(3.5),Inches(0.2),b,6,False,MID)
tx(s,Inches(5.0),Inches(4.5),Inches(3.7),Inches(0.55),"9 feedbacks: single Email, GDPR block, recaptcha unified, amount paused, WA, history.state, timeout wording, draft cleanup",6,False,GREEN,PP_ALIGN.LEFT,Pt(8))
sh=s.shapes.add_shape(1,Inches(9.1),Inches(0.9),Inches(3.73),Inches(5.3)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(9.25),Inches(1.0),Inches(3.4),Inches(0.2),"Non-functional",9,True,NAVY)
for i,(k,v) in enumerate([("Perf","P95 <=60s, API <=1s"),("Security","80bits + limit + lock"),("Availability","SMTP retry + 15s"),("Compliance","Consent + masked + audit"),("Compat","H5/PC + base /coupon/")]):
    y=Inches(1.35+i*0.5)
    sh=s.shapes.add_shape(1,Inches(9.25),y,Inches(3.43),Inches(0.4)); sh.fill.solid(); sh.fill.fore_color.rgb=GRAY; sh.line.fill.background()
    tx(s,Inches(9.3),y+Inches(0.1),Inches(0.7),Inches(0.2),k,6,True,NAVY,PP_ALIGN.CENTER)
    tx(s,Inches(10.1),y+Inches(0.1),Inches(2.5),Inches(0.2),v,6,False,MID)
sh=s.shapes.add_shape(1,Inches(9.25),Inches(4.1),Inches(3.43),Inches(0.65)); sh.fill.solid(); sh.fill.fore_color.rgb=RGBColor(0xFF,0xFB,0xEB); sh.line.color.rgb=RGBColor(0xFD,0xE6,0x8A)
tx(s,Inches(9.35),Inches(4.2),Inches(3.2),Inches(0.15),"Deferred",7,True,RGBColor(0xB4,0x53,0x09))
tx(s,Inches(9.35),Inches(4.4),Inches(3.2),Inches(0.3),"Amount / expiry display (needs billing API)",6,False,RGBColor(0xB4,0x53,0x09))
# S5 IA
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,BG)
sh=s.shapes.add_shape(1,Inches(0),Inches(0),Inches(13.33),Inches(0.6)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(0.6),Inches(0.2),Inches(9),Inches(0.3),"03  IA v1.2  |  P0-P4 closed loop",11,True,WHITE)
sh=s.shapes.add_shape(1,Inches(0.5),Inches(0.9),Inches(12.33),Inches(0.5)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(0.6),Inches(1.0),Inches(1),Inches(0.3),"Sitemap",7,True,NAVY)
for i,m in enumerate(["Entry","P0 /?t=","P1 overlay","P2 /success","P3 inline","P4 /help"]):
    x=Inches(1.7+i*1.75)
    sh=s.shapes.add_shape(1,x,Inches(1.05),Inches(1.55),Inches(0.3))
    sh.fill.solid(); sh.fill.fore_color.rgb=NAVY if i==1 else (TEAL if i==3 else GRAY); sh.line.fill.background()
    tx(s,x,Inches(1.05),Inches(1.55),Inches(0.3),m,6,True,WHITE if i in [1,3] else NAVY,PP_ALIGN.CENTER)
sh=s.shapes.add_shape(1,Inches(0.5),Inches(1.6),Inches(6.4),Inches(4.9)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(0.65),Inches(1.75),Inches(4),Inches(0.2),"Happy Path",9,True,NAVY)
tx(s,Inches(0.65),Inches(2.15),Inches(6.1),Inches(0.25),"Enter P0 -> URL has t? -> Yes prefill / No empty -> Fill Email+consent+captcha -> Submit",6,False,MID,PP_ALIGN.LEFT,Pt(9))
tx(s,Inches(0.65),Inches(2.55),Inches(6.1),Inches(0.25),"-> Frontend valid? -> No P3 inline / Yes P1 overlay -> Backend -> Success P2 / Fail P3",6,False,MID,PP_ALIGN.LEFT,Pt(9))
tx(s,Inches(0.65),Inches(3.0),Inches(6.1),Inches(0.5),"Notes: P2 masked email only; P3 keeps data; 15s timeout says check inbox first (10min); P0->P2 uses replace to block back re-submit",6,False,RGBColor(0x94,0xA3,0xB8),PP_ALIGN.LEFT,Pt(8))
add_table(s,Inches(0.65),Inches(3.7),Inches(6.1),Inches(2.35),[
["Current","Event","Result","Next"],
["P0","Submit","invalid","P3 inline"],
["P0","Submit","valid","P1 overlay"],
["P1","200","success","P2 replace"],
["P1","4xx/timeout","fail","P3 banner"],
["P2","back/WA","-","P0 push"],
],col_w=[Inches(1.4),Inches(1.4),Inches(1.4),Inches(1.9)])
sh=s.shapes.add_shape(1,Inches(7.15),Inches(1.6),Inches(5.68),Inches(4.9)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(7.3),Inches(1.75),Inches(4),Inches(0.2),"Validation & routing",9,True,NAVY)
for i,t in enumerate(["Email required, format, blur hint","Token required, trim, uppercase, 64 cap","Captcha required (none local / recaptcha prod)","Privacy checkbox required, blocks submit","Routing: history.state not URL, replace P0->P2"]):
    tx(s,Inches(7.35),Inches(2.05+i*0.28),Inches(5.3),Inches(0.25),"- "+t,6,False,MID)
tx(s,Inches(7.3),Inches(3.85),Inches(5.3),Inches(0.2),"Error mapping",7,True,NAVY)
add_table(s,Inches(7.3),Inches(4.1),Inches(5.38),Inches(1.9),[
["Code","Trigger","UI"],
["E101","Token not found","Global: invalid check"],
["E102","Already redeemed","Global: used"],
["E201/202","Rate limit","Global: try later"],
],col_w=[Inches(1.2),Inches(2.0),Inches(2.18)])
# S6 Implementation
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,BG)
sh=s.shapes.add_shape(1,Inches(0),Inches(0),Inches(13.33),Inches(0.6)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(0.6),Inches(0.2),Inches(9),Inches(0.3),"04  IMPLEMENTATION  |  PRD x Backend x Frontend",11,True,WHITE)
add_table(s,Inches(0.4),Inches(0.9),Inches(6.5),Inches(5.6),[
["#","PRD Need","Backend (v6)","Status"],
["1","Batch Token","POST /admin/import Excel->Token","Done"],
["2","Token store","batch_id + tokens[]","Done"],
["3","QR gen","GET /admin/qr?token PNG","Done"],
["4","Batch ZIP","GET /batch/{id}/qrs ZIP","Done"],
["5","Redeem check","POST /coupon/redeem exists","Done"],
["6","Email match","confirmed_email==email","Done"],
["7","Captcha","captcha_token + /config","Done"],
["8","Rate/lock","IP/email limit + lock","Done"],
["9","Email send","Async voucher","Done"],
["10","Mark used","REDEEMED+log","Done"],
["11","Amount/expiry","amount display","Paused"],
["12","WhatsApp","WA link (frontend)","Frontend"],
],col_w=[Inches(0.35),Inches(1.9),Inches(2.55),Inches(1.1)])
add_table(s,Inches(7.0),Inches(0.9),Inches(5.9),Inches(4.6),[
["#","Need","Frontend","Status"],
["1","Single Email","HookForm+Zod","Done"],
["2","Token prefill","?t= trim+upper","Done"],
["3","GDPR consent","Checkbox block","Done"],
["4","Captcha","reCAPTCHA ticket","Done"],
["5","Overlay","P1 mask 15s","Done"],
["6","Success","history.state mask","Done"],
["7","Help/WA","/help + wa.me","Done"],
["8","Router","/coupon + Nginx","Done"],
["9","Amount","placeholder removed","Paused"],
],col_w=[Inches(0.35),Inches(1.85),Inches(1.95),Inches(0.95)])
sh=s.shapes.add_shape(1,Inches(7.0),Inches(5.75),Inches(5.9),Inches(0.65)); sh.fill.solid(); sh.fill.fore_color.rgb=RGBColor(0xF0,0xFD,0xFA); sh.line.color.rgb=RGBColor(0x99,0xF6,0xE4)
tx(s,Inches(7.15),Inches(5.85),Inches(5.6),Inches(0.45),"Local none bypasses domain; prod recaptcha site-key 6Ldb...I_4 (coupon.v2power.com); QR should be full URL https://.../coupon/?t=V2P-XXX",6,False,RGBColor(0x0F,0x76,0x6E),PP_ALIGN.LEFT,Pt(8))
tx(s,Inches(0.4),Inches(6.65),Inches(8),Inches(0.2),"Backend 10/12 done, 1 paused (amount), 1 frontend | Frontend 8/9 done, 1 paused | PRD overlap ~90%",6,True,GREEN)
# S7 Demo
s=prs.slides.add_slide(prs.slide_layouts[6]); bg(s,BG)
sh=s.shapes.add_shape(1,Inches(0),Inches(0),Inches(13.33),Inches(0.6)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(0.6),Inches(0.2),Inches(8),Inches(0.3),"05  DEMO  |  Live verification",11,True,WHITE)
sh=s.shapes.add_shape(1,Inches(0.5),Inches(0.9),Inches(4.0),Inches(5.8)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
tx(s,Inches(0.65),Inches(1.05),Inches(3.7),Inches(0.2),"3 steps",9,True,NAVY)
for i,(a,b,c) in enumerate([("STEP 1 Scan/open","localhost:5173/?t=V2P-ENTHGXZK\nprod coupon.v2power.com/coupon/?t=XXX","Token auto-filled, editable"),("STEP 2 Fill+verify","Single Email + consent + captcha\nnone local / recaptcha prod","Inline error, enables Submit"),("STEP 3 Submit+inbox","P1 overlay -> success masked\nEmail holds voucher","15s says check inbox, WA fallback")]):
    y=Inches(1.35+i*1.5)
    sh=s.shapes.add_shape(1,Inches(0.65),y,Inches(3.7),Inches(1.3)); sh.fill.solid(); sh.fill.fore_color.rgb=GRAY; sh.line.fill.background()
    tx(s,Inches(0.75),y+Inches(0.1),Inches(3.5),Inches(0.2),a,7,True,NAVY)
    tx(s,Inches(0.75),y+Inches(0.35),Inches(3.5),Inches(0.45),b,6,False,MID,PP_ALIGN.LEFT,Pt(8))
    tx(s,Inches(0.75),y+Inches(0.85),Inches(3.5),Inches(0.3),c,6,False,RGBColor(0x94,0xA3,0xB8))
sh=s.shapes.add_shape(1,Inches(4.75),Inches(0.9),Inches(4.5),Inches(5.8)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
sh2=s.shapes.add_shape(1,Inches(4.75),Inches(0.9),Inches(4.5),Inches(0.35)); sh2.fill.solid(); sh2.fill.fore_color.rgb=GRAY; sh2.line.fill.background()
tx(s,Inches(4.85),Inches(1.0),Inches(4.3),Inches(0.2),"coupon.v2power.com /coupon/  ?t=V2P-ENTHGXZK",6,False,MID,PP_ALIGN.CENTER)
tx(s,Inches(4.9),Inches(1.45),Inches(4.2),Inches(0.2),"V2Power  Voucher Redeem",9,True,NAVY,PP_ALIGN.CENTER)
tx(s,Inches(4.9),Inches(1.7),Inches(4.2),Inches(0.2),"Enter Email and Token to receive voucher",6,False,MID,PP_ALIGN.CENTER)
for i,(lb,val) in enumerate([("Email *","you@example.com"),("Token *","V2P-ENTHGXZK")]):
    y=Inches(2.1+i*0.85)
    tx(s,Inches(4.9),y,Inches(4.2),Inches(0.15),lb,6,True,NAVY)
    sh=s.shapes.add_shape(1,Inches(4.9),y+Inches(0.18),Inches(4.2),Inches(0.38)); sh.fill.solid(); sh.fill.fore_color.rgb=WHITE; sh.line.color.rgb=BD
    tx(s,Inches(5.0),y+Inches(0.25),Inches(4),Inches(0.2),val,7,False,NAVY)
sh=s.shapes.add_shape(1,Inches(4.9),y+Inches(0.65),Inches(4.2),Inches(0.38)); sh.fill.solid(); sh.fill.fore_color.rgb=TEAL; sh.line.fill.background()
tx(s,Inches(4.9),y+Inches(0.7),Inches(4.2),Inches(0.28),"Redeem  ->",9,True,NAVY,PP_ALIGN.CENTER)
sh=s.shapes.add_shape(1,Inches(9.55),Inches(0.9),Inches(3.28),Inches(5.8)); sh.fill.solid(); sh.fill.fore_color.rgb=NAVY; sh.line.fill.background()
tx(s,Inches(9.7),Inches(1.05),Inches(3),Inches(0.2),"Delivery",9,True,WHITE)
for i,(k,v) in enumerate([("Build","dist.zip 116KB\n341KB js\nbase /coupon/"),("Deploy","Nginx try_files\nproxy_pass :8088"),("Env",".env none\n.prod recaptcha"),("QR note","Full URL\n/coupon/?t=XXX")]):
    y=Inches(1.4+i*1.05)
    sh=s.shapes.add_shape(1,Inches(9.7),y,Inches(2.98),Inches(0.9)); sh.fill.solid(); sh.fill.fore_color.rgb=RGBColor(0x0E,0x2E,0x4F); sh.line.fill.background()
    tx(s,Inches(9.8),y+Inches(0.05),Inches(2.8),Inches(0.15),k,6,True,TEAL)
    tx(s,Inches(9.8),y+Inches(0.25),Inches(2.8),Inches(0.5),v,6,False,RGBColor(0xC0,0xD0,0xE6),PP_ALIGN.LEFT,Pt(8))
sh=s.shapes.add_shape(1,Inches(9.7),Inches(6.05),Inches(2.98),Inches(0.35)); sh.fill.solid(); sh.fill.fore_color.rgb=TEAL; sh.line.fill.background()
tx(s,Inches(9.7),Inches(6.1),Inches(2.98),Inches(0.25),"Ready for demo",8,True,NAVY,PP_ALIGN.CENTER)
import os
out="C:/Users/13289/Documents/V2power/v2power-coupon-frontend/V2Power_Coupon_Report_2026-08-25.pptx"
prs.save(out)
print(f"saved {out} slides={len(prs.slides)}")
try:
    import shutil
    shutil.copy(out, "C:/Users/13289/Documents/V2power/v2power-coupon-frontend/dist/V2Power_Coupon_Report_2026-08-25.pptx")
    print("copied to dist")
except Exception as e: print(e)
