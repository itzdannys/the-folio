"""Generate locally bundled, number-free SVG dice icons from true polyhedral meshes.
Each die has its correct *total* number of faces; only camera-facing faces appear.
Requires numpy/scipy for regeneration; the shipped app has no Python dependency.
"""
from pathlib import Path
import numpy as np
from scipy.spatial import ConvexHull
from scipy.spatial.transform import Rotation
import html
from math import pi, sin, cos

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'dice'
OUT.mkdir(parents=True,exist_ok=True)

def hull_mesh(points):
    pts=np.asarray(points,float)
    hull=ConvexHull(pts)
    return pts,[list(face) for face in hull.simplices]

def shape(sides):
    if sides==4:
        return hull_mesh([(1,1,1),(-1,-1,1),(-1,1,-1),(1,-1,-1)])
    if sides==6:
        p=np.array([(x,y,z) for x in [-1,1] for y in [-1,1] for z in [-1,1]],float)
        f=[]
        for k in range(3):
            for side in (-1,1):
                inds=[i for i,v in enumerate(p) if v[k]==side]
                c=p[inds].mean(axis=0)
                a,b=[u for u in range(3) if u!=k]
                inds.sort(key=lambda idx:np.arctan2(p[idx][b]-c[b],p[idx][a]-c[a]))
                f.append(inds)
        return p,f
    if sides==8:
        return hull_mesh([(sgn if i==axis else 0) for _ in [] for i in []] if False else [tuple((sgn if i==axis else 0) for i in range(3)) for axis in range(3) for sgn in [-1,1]])
    if sides in (20,12):
        phi=(1+5**.5)/2
        pts=[]
        for a in (-1,1):
            for b in (-1,1):
                pts.extend([(0,a,b*phi),(a,b*phi,0),(b*phi,0,a)])
        ico,faces=hull_mesh(pts)
        if sides==20:
            return ico,faces
        # Dodecahedron is the dual of an icosahedron: 20 vertices, 12 pentagons.
        centers=np.array([ico[face].mean(axis=0) for face in faces])
        result=[]
        for ix,vert in enumerate(ico):
            adjacent=[fi for fi,face in enumerate(faces) if ix in face]
            axis=vert/np.linalg.norm(vert)
            guide=np.array([0.,0.,1.]) if abs(axis[2])<.95 else np.array([0.,1.,0.])
            u=np.cross(axis,guide);u/=np.linalg.norm(u)
            v=np.cross(axis,u)
            adjacent.sort(key=lambda fi:np.arctan2(np.dot(centers[fi],v),np.dot(centers[fi],u)))
            result.append(adjacent)
        return centers,result
    if sides==10:
        # Polar dual of a pentagonal antiprism => 10 planar kite faces.
        antiprism=[]
        for i in range(5):
            t=2*pi*i/5
            antiprism.append([cos(t),sin(t),.48])
        for i in range(5):
            t=2*pi*(i+.5)/5
            antiprism.append([cos(t),sin(t),-.48])
        antiprism=np.asarray(antiprism,float)
        prior=[list(range(5)),list(range(9,4,-1))]
        for i in range(5):
            j=(i+1)%5
            prior.extend([[i,5+i,j],[5+i,5+j,j]])
        dual=[]
        for f in prior:
            q=antiprism[f]
            n=np.cross(q[1]-q[0],q[2]-q[0]);n/=np.linalg.norm(n)
            if np.dot(n,q.mean(axis=0))<0:n*=-1
            dual.append(n/np.dot(n,q.mean(axis=0)))
        dual=np.asarray(dual)
        result=[]
        for ix,vert in enumerate(antiprism):
            adjacent=[fi for fi,f in enumerate(prior) if ix in f]
            axis=vert/np.linalg.norm(vert)
            guide=np.array([0.,0.,1.]) if abs(axis[2])<.95 else np.array([0.,1.,0.])
            u=np.cross(axis,guide);u/=np.linalg.norm(u)
            v=np.cross(axis,u)
            adjacent.sort(key=lambda fi:np.arctan2(np.dot(dual[fi],v),np.dot(dual[fi],u)))
            result.append(adjacent)
        return dual,result
    raise ValueError(sides)

def generate(sides):
    vertices,faces=shape(sides)
    assert len(faces)==sides,(sides,len(faces))
    # Fixed display orientations chosen for readable face relationships.
    angles={4:(24,-29,11),6:(23,-30,15),8:(24,-30,18),10:(29,-25,13),12:(22,-26,10),20:(25,-26,16)}[sides]
    r=Rotation.from_euler('xyz',angles,degrees=True).as_matrix()
    vertices=vertices @ r.T
    all_polys=[]
    for i, face in enumerate(faces):
        q=vertices[face]
        normal=np.cross(q[1]-q[0],q[2]-q[0]);normal/=np.linalg.norm(normal)
        if np.dot(normal,q.mean(axis=0))<0:normal*=-1
        if normal[2]<=.095:continue
        all_polys.append((i,q,normal))
    visible_verts=np.concatenate([x[1] for x in all_polys],axis=0)
    lower=visible_verts[:,:2].min(axis=0);upper=visible_verts[:,:2].max(axis=0)
    span=max(upper-lower)
    scale=54/span
    midpoint=(lower+upper)/2
    def project(q):
        return [((v[0]-midpoint[0])*scale+36,36-(v[1]-midpoint[1])*scale) for v in q]
    colors=['#402b46','#523653','#624565','#705273','#37253e']
    light=np.array([-.48,.65,.65]);light/=np.linalg.norm(light)
    rows=[]
    for i,q,normal in sorted(all_polys,key=lambda x:x[1][:,2].mean()):
        poly=project(q)
        shape_str=' '.join(f'{x:.2f},{y:.2f}' for x,y in poly)
        brightness=np.dot(normal,light)
        color=colors[min(4,max(0,int((brightness+1)*2.4)))]
        # The compact picker deliberately shows shapes only, no face numbers.
        rows.append(f'<polygon points="{shape_str}" fill="{color}" stroke="#dfc89c" stroke-width="1.25" stroke-linejoin="round"/>')

    content=f'''<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" role="img" aria-labelledby="t">
<title id="t">d{sides} polyhedral die shape</title>
<defs><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2.3" stdDeviation="1.4" flood-color="#201227" flood-opacity=".35"/></filter></defs>
<g filter="url(#shadow)">{''.join(rows)}</g></svg>'''
    (OUT/f'd{sides}.svg').write_text(content,encoding='utf-8')
    print(sides,'faces:',len(faces),'visible:',len(all_polys))

if __name__=='__main__':
    for n in [20,12,10,8,6,4]:generate(n)
