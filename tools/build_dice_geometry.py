"""Build offline 3D polyhedron meshes from the same geometry as the icon generator."""
import json
from pathlib import Path
from generate_dice import shape
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
meshes={}
for sides in [4,6,8,10,12,20]:
    verts,faces=shape(sides)
    verts=np.asarray(verts,dtype=float)
    verts=verts/np.max(np.linalg.norm(verts,axis=1))
    clean=[]
    for face in faces:
        f=list(map(int,face))
        v=verts[f];n=np.cross(v[1]-v[0],v[2]-v[0])
        if np.dot(n,v.mean(axis=0))<0:f=f[::-1]
        clean.append(f)
    assert len(clean)==sides,(sides,len(clean))
    meshes[str(sides)]={'vertices':verts.round(6).tolist(),'faces':clean}
source='(function(root){"use strict";root.FolioDiceGeometry='+json.dumps(meshes,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=root.FolioDiceGeometry;})(typeof window!=="undefined"?window:globalThis);\n'
(ROOT/'js'/'dice-geometry.js').write_text(source,encoding='utf-8')
print({s:len(m['faces']) for s,m in meshes.items()})
