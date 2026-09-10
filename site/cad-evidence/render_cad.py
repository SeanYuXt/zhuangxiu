from pathlib import Path
import sys
import ezdxf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.transforms import Affine2D
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.config import Configuration, ColorPolicy, BackgroundPolicy

root = Path(__file__).parent
doc = ezdxf.readfile(root / (sys.argv[2] if len(sys.argv)>2 else 'building.dxf'))
name = sys.argv[1] if len(sys.argv)>1 else 'AX-6-BZC1'
fig = plt.figure(figsize=(20,12))
ax = fig.add_axes([0,0,1,1])
crop = len(sys.argv)>3 and sys.argv[3]=='unit'
if crop:
    ax.transData = Affine2D().rotate_deg(90) + ax.transData
config = Configuration(color_policy=ColorPolicy.COLOR, background_policy=BackgroundPolicy.WHITE)
Frontend(RenderContext(doc), MatplotlibBackend(ax), config=config).draw_entities(doc.blocks[name])
ax.autoscale(True)
if crop:
    ax.set_xlim(-18000,1300)
    ax.set_ylim(27100,36200)
ax.set_aspect('equal')
ax.axis('off')
fig.savefig(root / (name + ('-unit' if crop else '') + '.png'), dpi=160)
print(name, ax.get_xlim(), ax.get_ylim())
