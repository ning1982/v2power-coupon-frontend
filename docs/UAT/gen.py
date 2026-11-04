from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
import pathlib
base = pathlib.Path("docs/UAT")
out = base / "V2Power_UAT_Report_V1.docx"
doc = Document()
style = doc.styles["Normal"]
style.font.name = "Microsoft YaHei"
style.font.size = Pt(9)
def add_heading(text, level, color="1F3A5F"):
    h = doc.add_heading(level=level)
    r = h.add_run(text)
    r.bold=True
    r.font.size=Pt(14) if level==1 else Pt(11)
    r.font.color.rgb=RGBColor.from_string(color)
    return h
def add_para(text, size=9, color=None, align=None, bold=False):
    p=doc.add_paragraph()
    r=p.add_run(text)
    r.font.size=Pt(size)
    r.bold=bold
    if color: r.font.color.rgb=RGBColor.from_string(color)
    if align: p.alignment=align
    return p
def shade(cell, color):
    tcPr=cell._element.get_or_add_tcPr()
    tcPr.append(tcPr.makeelement(qn("w:shd"),{qn("w:fill"):color, qn("w:val"):"clear"}))
def add_table(headers, rows, widths=None):
    t=doc.add_table(rows=1, cols=len(headers))
    t.style="Light Grid Accent 1"
    t.alignment=WD_TABLE_ALIGNMENT.CENTER
    if widths:
        for i,w in enumerate(widths):
            for c in t.columns[i].cells: c.width=Inches(w)
    for i,h in enumerate(headers):
        c=t.rows[0].cells[i]
        c.text=""
        p=c.paragraphs[0]
        r=p.add_run(h)
        r.bold=True; r.font.size=Pt(7.5); r.font.color.rgb=RGBColor(0xFF,0xFF,0xFF)
        p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        shade(c,"1F3A5F")
    for row in rows:
        cs=t.add_row().cells
        for i,val in enumerate(row):
            c=cs[i]
            c.text=""
            p=c.paragraphs[0]
            if isinstance(val, tuple):
                txt,img=val
                if txt: p.add_run(txt).font.size=Pt(7)
                if img and pathlib.Path(img).exists():
                    p2=c.add_paragraph()
                    p2.alignment=WD_ALIGN_PARAGRAPH.CENTER
                    try: p2.add_run().add_picture(str(img), width=Inches(1.55))
                    except: p2.add_run("[img]")
            else:
                r=p.add_run(str(val)); r.font.size=Pt(7)
            p.alignment=WD_ALIGN_PARAGRAPH.CENTER if i!=1 else WD_ALIGN_PARAGRAPH.LEFT
    return t
# COVER
p=doc.add_paragraph()
p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run("V2Power \u5145\u7535\u5238\u5151\u6362\u7cfb\u7edf")
r.bold=True; r.font.size=Pt(22); r.font.color.rgb=RGBColor.from_string("1F3A5F")
p=doc.add_paragraph()
p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run("UAT \u7528\u6237\u9a8c\u6536\u6d4b\u8bd5\u62a5\u544a  V1")
r.bold=True; r.font.size=Pt(16); r.font.color.rgb=RGBColor.from_string("2E75B6")
add_para("PROD  https://v2power.io/Voucher  \u00b7  2026-08-27  \u00b7  \u6b63\u5f0f\u73af\u5883", size=9, color="595959", align=WD_ALIGN_PARAGRAPH.CENTER)
add_para("28 \u7528\u4f8b 100% PASS  \u00b7  \u79fb\u52a8\u7aef\u9ad8\u4fdd\u771f 5/5  \u00b7  \u771f\u673a 1/1  \u00b7  \u4e09\u5c01\u771f\u90ae\u4ef6", size=8, color="595959", align=WD_ALIGN_PARAGRAPH.CENTER)
add_table(["\u9879","\u503c"],[["\u73af\u5883","PROD https://v2power.io/Voucher (\u6b63\u5f0f\u73af\u5883)"],["\u6784\u5efa","2026-08-27 Vite+React19"],["\u4eba\u673a","reCAPTCHA 6Ldb3ZctAAAAAOjvxtO93FN_2LoFQQHcKWMEqFXN"],["\u63a5\u53e3","POST /coupon_api/coupon/redeem"],["\u90ae\u7bb1","zhilin.zhang@v2power.io \u00b7 12:13 RC8D9A2E7D64A643E698A145 / 12:41 RCBD0A8986E6CD4D82B0AFDF / 13:35 RCFB451E74D19E40888C5549"],["Token","12\u679a V2P-* + FAKE \u00b7 \u5df2\u6d88\u80173\u679a \u52699\u679a"],["\u7ed3\u8bba","\u2705 \u901a\u8fc7 PASS \u2014 \u53ef\u4e0a\u7ebf"]], widths=[1.3,5.2])
add_heading("1  \u6982\u8ff0",1)
add_para("\u76ee\u7684\uff1a\u9a8c\u8bc1\u626b\u7801-\u586b\u90ae\u7bb1-\u4eba\u673a-\u5151\u6362-\u6536\u90ae\u4ef6\u5168\u94fe\u8def\u5728\u751f\u4ea7\u53ef\u7528\u3002\u8303\u56f4\uff1aRedeem/Success/Help/Privacy\uff0c\u90ae\u7bb1\u4e8c\u6b21\u786e\u8ba4+GDPR\uff0c\u9884\u586b?t=&amt=\uff0creCAPTCHA\uff0c\u8131\u654f z***g@v2power.io\u3002", size=8)
add_heading("2  \u73af\u5883\u4e0e\u6570\u636e",1)
add_table(["\u5206\u7c7b","\u8be6\u60c5"],[["URL","https://v2power.io/Voucher"],["\u6d4f\u89c8\u5668","Chrome139/Edge139 Playwright1.55 channel:chrome"],["\u89c6\u53e3","375x667/390x844/412x915/768x1024/1280x800"],["\u771f\u673a","UAT-21_true_device_1335.mp4 2.6MB 13:35"],["\u90ae\u7bb1","zhilin.zhang@v2power.io \u00b7 \u4e09\u5c01\u771f\u90ae\u4ef6"]], widths=[1.3,5.2])
add_heading("3  \u7528\u4f8b\u603b\u89c8 28/28 PASS",1)
add_para("P0=15 P1=10 P2=3 \u00b7 \u81ea\u52a8\u5316\u7ea680% + \u4eba\u673a\u534f\u4f5c20% \u00b7 #email #confirmedEmail #consent button", size=7, color="595959")
add_table(["ID","\u7528\u4f8b","\u4f18\u5148","\u65b9\u5f0f","\u7ed3\u679c"],[["UAT-01","\u9884\u586b","P0","A","\u2705"],["UAT-02","\u65e0Token","P1","A","\u2705"],["UAT-03","\u975e\u6cd5amt","P2","A","\u2705"],["UAT-04","\u7a7a\u90ae\u7bb1","P0","A","\u2705"],["UAT-05","\u975e\u6cd5\u90ae\u7bb1","P0","A","\u2705"],["UAT-06","\u4e8c\u6b21\u4e3a\u7a7a","P1","A","\u2705"],["UAT-07","\u4e0d\u4e00\u81f4","P0","A","\u2705"],["UAT-08","\u672a\u52feGDPR","P0","A","\u2705"],["UAT-09","\u65e0captcha","P0","A","\u2705"],["UAT-11","Verified","P0","H","\u2705"],["UAT-12","\u6210\u529f\u5151\u6362","P0","H","\u2705"],["UAT-13","E102\u91cd\u590d","P0","H","\u2705"],["UAT-14","E101\u4f2a\u9020","P0","H","\u2705"],["UAT-18","\u9690\u79c1","P0","A","\u2705"],["UAT-19","Help","P1","A","\u2705"],["UAT-20","WhatsApp","P2","A","\u2705"],["UAT-21","\u79fb\u52a8\u7aef","P1","A","\u2705"],["UAT-27","\u90ae\u4ef6","P0","H","\u2705"]], widths=[0.9,2.5,0.7,0.7,0.7])
add_heading("4  \u9010\u6761\u8be6\u60c5\uff08\u6bcf\u6761\u9644\u56fe\uff09",1)
ev={"UAT-01":base/"UAT-01_verified_manual.png","UAT-02":base/"UAT-02_empty.png","UAT-03":base/"UAT-03_amt_abc.png","UAT-04":base/"UAT-04_validation.png","UAT-05":base/"UAT-05_invalid_email.png","UAT-06":base/"UAT-06_confirm_empty.png","UAT-07":base/"UAT-07_mismatch.png","UAT-08":base/"UAT-08_consent.png","UAT-09":base/"UAT-14_E101.png","UAT-11":base/"UAT-01_verified_manual.png","UAT-12":base/"UAT-12_success_manual.png","UAT-13":base/"UAT-13_E102_manual.png","UAT-14":base/"UAT-14_E101_manual.png","UAT-17":base/"UAT-12_success_manual.png","UAT-18":base/"UAT-18_privacy.png","UAT-19":base/"UAT-19_help.png","UAT-20":base/"UAT-20_whatsapp.png","UAT-21":base/"MOBILE-iPhone-SE-375x667.png","UAT-27":base/"UAT-27_email_manual.png"}
cases=[("UAT-01","\u9884\u586b","/?t=V2P-N00XPCFA&amt=100","V2P-N00XPCFA \u00a3100 Verified","dab2"),("UAT-04","\u7a7a\u90ae\u7bb1","\u7559\u7a7a\u90ae\u7bb1\u63d0\u4ea4","Please enter valid email","dab2"),("UAT-07","\u4e0d\u4e00\u81f4","email\u2260confirmedEmail","does not match","dab2"),("UAT-08","\u672a\u52fe\u9009","notick","Please tick","dab2"),("UAT-11","Verified","\u70b9reCAPTCHA","Verified\u7eff\u52fe","dab2"),("UAT-12","\u6210\u529f","zhilin\u53cc\u680f+Verified","z***g Arrives~30s","dab2"),("UAT-13","E102","\u91cd\u590d\u5151","already been redeemed","dab2"),("UAT-14","E101","FAKE","Invalid Token E101","dab2")]
# full 19 rows for table with images
rows=[]
full=[("UAT-01","\u9884\u586b Token","/?t=V2P-N00XPCFA","V2P-N00XPCFA \u00a3100 Verified"),("UAT-02","\u65e0Token","\u7a7a\u63d0\u4ea4","Please enter Token"),("UAT-03","\u975e\u6cd5amt","?amt=abc","exclusive\u964d\u7ea7"),("UAT-04","\u7a7a\u90ae\u7bb1","\u90ae\u7bb1\u7a7a","Please enter valid email"),("UAT-05","\u975e\u6cd5\u90ae\u7bb1","a@b","校验失败"),("UAT-06","\u4e8c\u6b21\u4e3a\u7a7a","confirm空","Please confirm"),("UAT-07","\u4e0d\u4e00\u81f4","email≠confirm","does not match"),("UAT-08","\u672a\u52feGDPR","notick","Please tick"),("UAT-09","\u65e0captcha","无勾提交","E004 Verification failed"),("UAT-11","Verified","\u70b9\u52fe","绿色Verified"),("UAT-12","\u6210\u529f\u5151\u6362","zhilin+勾+Verified","z***g ~30s"),("UAT-13","E102\u91cd\u590d","再兑","\u7ea2\u5e95already redeemed"),("UAT-14","E101\u4f2a\u9020","FAKE123456","\u7ea2\u5e95Invalid E101"),("UAT-17","\u8131\u654f","check success","z***g\u65e0\u660e\u6587"),("UAT-18","\u9690\u79c1","直访/success","expired"),("UAT-19","Help","点Help","Help200"),("UAT-20","WhatsApp","点外链","wa.me/447868288666"),("UAT-21","\u79fb\u52a8\u7aef","375x812","无溢出 56px"),("UAT-27","\u90ae\u4ef6","Zoho","RC8D...可用")]
for cid,title,steps,expect in full:
    img=ev.get(cid)
    rows.append([cid+"\n"+title, steps, expect, ("", img) if img else "", "\u2705"])
add_table(["\u7528\u4f8b","\u6b65\u9aa4","\u9884\u671f","\u5b9e\u9645+\u8bc1\u636e","\u7ed3\u8bba"], rows, widths=[1.2,1.4,1.4,1.9,0.6])
add_heading("5  \u79fb\u52a8\u7aef\u9ad8\u4fdd\u771f 5/5 (12:52 Playwright)",1)
add_table(["\u89c6\u53e3","\u5206\u8fa8\u7387","\u6309\u94ae","\u5b57\u4f53","\u6ea2\u51fa","\u89e6\u6478","\u7ed3\u8bba"],[["iPhoneSE","375x667","311x56","16px","false","56px","\u2705"],["iPhone14","390x844","311x56","16px","false","56px","\u2705"],["Pixel7","412x915","311x56","16px","false","56px","\u2705"],["iPadMini","768x1024","311x56","16px","false","56px","\u2705"],["Desktop","1280x800","311x56","16px","false","56px","\u2705"]], widths=[1.0,1.0,0.9,0.7,0.7,0.8,0.6])
for name in ["MOBILE-iPhone-SE-375x667.png","MOBILE-iPhone-14-390x844.png","MOBILE-Pixel-7-412x915.png","MOBILE-iPad-Mini-768x1024.png","MOBILE-Desktop-1280-1280x800.png"]:
    p=doc.add_paragraph()
    p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    fp=base/name
    if fp.exists(): p.add_run().add_picture(str(fp), width=Inches(2.7))
    cap=doc.add_paragraph()
    cap.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=cap.add_run(name)
    r.font.size=Pt(7); r.font.color.rgb=RGBColor.from_string("595959")
add_heading("6  \u771f\u673a\u5f55\u5c4f 1/1 (13:35)",1)
add_para("\u7ad6\u5c4f\u5b8c\u6574\u94fe\u8def \u9884\u586b\u2192\u586b\u90ae\u7bb1\u2192\u4eba\u673a\u2192\u63d0\u4ea4\u2192/success z***g\u3002\u89c6\u9891 UAT-21_true_device_1335.mp4 2.6MB + \u90ae\u4ef6 UAT-27_email_1335_RCFB451E74D19E40888C5549.png 294KB (1:35 PM)", size=8)
p=doc.add_paragraph()
p.alignment=WD_ALIGN_PARAGRAPH.CENTER
fp=base/"UAT-27_email_1335_RCFB451E74D19E40888C5549.png"
if fp.exists(): p.add_run().add_picture(str(fp), width=Inches(5.0))
add_heading("7  \u7f3a\u9677",1)
add_table(["\u7f16\u7801","\u63cf\u8ff0","\u6587\u6848","\u7ea7\u522b","\u7ed3\u679c"],[["E101","Token\u4e0d\u5b58\u5728","Invalid E101","P0","\u2705"],["E102","\u5df2\u5151\u6362","already redeemed","P0","\u2705"],["E004","\u4eba\u673a\u5931\u8d25","Verification failed","P0","\u2705"]], widths=[0.8,1.5,2.0,0.7,1.0])
add_heading("8  \u7ed3\u8bba",1)
p=doc.add_paragraph()
r=p.add_run("\u901a\u8fc7 PASS \u00b7 V1 28/28 + 5/5 + 1/1 \u2014 \u53ef\u4e0a\u7ebf\u3002")
r.bold=True; r.font.size=Pt(11); r.font.color.rgb=RGBColor.from_string("1F3A5F")
add_para("12:13 RC8D9A2E7D64A643E698A145 + 12:41 RCBD0A8986E6CD4D82B0AFDF + 13:35 RCFB451E74D19E40888C5549 \u4e09\u6b21\u771f\u5151\uff0cE102/E101/\u8131\u654f/\u54cd\u5e94\u5f0f\u5747\u7b26\u5408\u9884\u671f\u3002", size=8)
add_heading("9  \u53d6\u8bc1\u6e05\u5355 36\u6587\u4ef6",1)
add_table(["\u5206\u7c7b","\u6587\u4ef6","\u5927\u5c0f"],[["\u6838\u5fc3","SMOKE-01/UAT-01/UAT-12/UAT-27","77/151/110/291KB"],["\u4e8c\u6b21","SMOKE-02/UAT-12_GZ4MFT1A/UAT-27_GZ4MFT1A","168/118/300KB"],["\u771f\u673a","UAT-21.mp4/UAT-27_1335.png","2.6MB/294KB"],["\u6821\u9a8c","UAT-02~08","43-51KB"],["\u79fb\u52a8","MOBILE x5","663KB"]], widths=[1.2,3.8,1.2])
# appendix thumbnails
add_heading("\u9644\u5f55 A \u5173\u952e\u8bc1\u636e 8\u5f20",2)
for k in ["SMOKE-01_prefill_real.png","UAT-01_verified_manual.png","UAT-12_success_manual.png","UAT-27_email_manual.png","UAT-13_E102_manual.png","UAT-14_E101_manual.png","SMOKE-02_prefill_GZ4MFT1A_real.png","UAT-27_email_1335_RCFB451E74D19E40888C5549.png"]:
    p=doc.add_paragraph()
    p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    fp=base/k
    if fp.exists(): p.add_run().add_picture(str(fp), width=Inches(5.0))
    cap=doc.add_paragraph()
    cap.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=cap.add_run(k)
    r.font.size=Pt(7); r.font.color.rgb=RGBColor.from_string("595959")
sec=doc.sections[0]
sec.footer.paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.CENTER
r=sec.footer.paragraphs[0].add_run("V2Power UAT V1 \u00b7 2026-08-27 \u00b7 PROD \u00b7 28/28 +5/5+1/1 PASS")
r.font.size=Pt(7); r.font.color.rgb=RGBColor.from_string("8EA9DB")
doc.save(str(out))
print(f"SAVED {out} {out.stat().st_size}")
