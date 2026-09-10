"""Readable diagnostic crop: no replacement of the furnished web model."""
from pathlib import Path
import json,logging
import ezdxf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.transforms import Affine2D
from matplotlib.font_manager import FontProperties
from ezdxf.addons.drawing import RenderContext,Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.config import Configuration,ColorPolicy,BackgroundPolicy,TextPolicy
logging.disable(logging.CRITICAL)
root=Path(__file__).parent
doc=ezdxf.readfile(root/'diagnostic-recovered.dxf')
for layer in doc.layers:
    name=layer.dxf.name.lower()
    if any(k in name for k in ['grid','anno-dims','anno-levl','wind-iden','room-iden','recovered-text']):layer.off()

fig=plt.figure(figsize=(20,9.4),facecolor='#fffdf8')
ax=fig.add_axes([.025,.13,.95,.76])
ordinary=ax.transData
ax.transData=Affine2D().rotate_deg(90)+ordinary
config=Configuration(color_policy=ColorPolicy.BLACK,background_policy=BackgroundPolicy.WHITE,text_policy=TextPolicy.IGNORE)
Frontend(RenderContext(doc),MatplotlibBackend(ax),config=config).draw_entities(doc.blocks['AX-6-BZC'])
ax.set_xlim(-17850,1100);ax.set_ylim(28100,36100)
ax.set_aspect('equal',adjustable='box');ax.axis('off')
font=FontProperties(fname='C:/Windows/Fonts/simhei.ttf')
labels=[('左侧卧室',31900,15600),('厨房',32000,12800),('公卫',29400,16400),('餐厅',30800,9900),('客厅',31000,7500),('主卧',33500,1800),('主卫',33800,4150),('右侧次卧',29200,1800),('阳台 / 湖景方向',35300,8600),('入户',28600,10800)]
for text,x,y in labels:
    ax.text(-y,x,text,transform=ordinary,fontproperties=font,fontsize=12,ha='center',va='center',color='#183f40',bbox=dict(boxstyle='round,pad=.3',fc='#fffdf2',ec='#acb8ae',alpha=.96),zorder=100)
fig.text(.03,.955,'13 层 · 大横厅 CAD 定位核对',fontproperties=font,fontsize=22,color='#203736')
fig.text(.03,.915,'取自标准层平面图二；旋转至与《1号房.pdf》一致的方向。01 门牌来自用户确认。',fontproperties=font,fontsize=11,color='#566362')
fig.text(.03,.075,'这是原 CAD 的诊断恢复图，不是装修效果图，也不是完整 T3 文件。墙线及开口字段已提取；门扇开启方向、尺寸及专用符号仍待核验。',fontproperties=font,fontsize=11,color='#6d5342')
fig.text(.03,.04,'原图家具仅作示意。用户确认的阳台中柱继续保留，不能因为本次恢复图未显示就删除。',fontproperties=font,fontsize=11,color='#6d5342')
fig.savefig(root/'13层大横厅-CAD核对.png',dpi=160,facecolor=fig.get_facecolor())
fig.savefig(root/'13层大横厅-CAD核对.svg',facecolor=fig.get_facecolor())
print('rendered CAD crop')
