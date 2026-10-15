"""Genera rsrc_windows_amd64.syso con el icono del juego para el ejecutable de Windows (sin herramientas externas)."""
import io, struct, sys
from PIL import Image

src = sys.argv[1]
base = Image.open(src).convert('RGBA')
sizes = [16, 24, 32, 48, 64, 128, 256]
pngs = []
for s in sizes:
    im = base.resize((s, s), Image.NEAREST if s >= 64 else Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'PNG'); pngs.append(b.getvalue())

# --- árbol de recursos ---
# Nivel 1: tipos 3 (RT_ICON) y 14 (RT_GROUP_ICON)
n = len(pngs)
grp = struct.pack('<HHH', 0, 1, n)
for i, (s, data) in enumerate(zip(sizes, pngs)):
    grp += struct.pack('<BBBBHHIH', s if s < 256 else 0, s if s < 256 else 0, 0, 0, 1, 32, len(data), i + 1)

DIR = 16; ENT = 8; DATA = 16
def dirhdr(nid): return struct.pack('<IIHHHH', 0, 0, 0, 0, 0, nid)

# disposición
off_root = 0
off_l2_icon = off_root + DIR + 2 * ENT
off_l2_grp = off_l2_icon + DIR + n * ENT
off_l3_icon = off_l2_grp + DIR + 1 * ENT          # n directorios de idioma
off_l3_grp = off_l3_icon + n * (DIR + ENT)
off_data_entries = off_l3_grp + DIR + ENT
off_payload = off_data_entries + (n + 1) * DATA
LANG = 0x0409

buf = bytearray()
relocs = []
buf += dirhdr(2)
buf += struct.pack('<II', 3, 0x80000000 | off_l2_icon)
buf += struct.pack('<II', 14, 0x80000000 | off_l2_grp)
buf += dirhdr(n)
for i in range(n):
    buf += struct.pack('<II', i + 1, 0x80000000 | (off_l3_icon + i * (DIR + ENT)))
buf += dirhdr(1)
buf += struct.pack('<II', 1, 0x80000000 | off_l3_grp)
for i in range(n):
    buf += dirhdr(1); buf += struct.pack('<II', LANG, off_data_entries + i * DATA)
buf += dirhdr(1); buf += struct.pack('<II', LANG, off_data_entries + n * DATA)
assert len(buf) == off_data_entries
payloads = pngs + [grp]
pos = off_payload
entries = bytearray()
placed = []
for data in payloads:
    pos = (pos + 7) & ~7
    placed.append(pos)
    pos += len(data)
for i, data in enumerate(payloads):
    relocs.append(off_data_entries + i * DATA)  # campo OffsetToData (RVA) -> reubicación
    entries += struct.pack('<IIII', placed[i], len(data), 0, 0)
buf += entries
for i, data in enumerate(payloads):
    while len(buf) < placed[i]: buf += b'\0'
    buf += data
while len(buf) % 4: buf += b'\0'

# --- objeto COFF ---
nrel = len(relocs)
hdr_size = 20 + 40
raw_ptr = hdr_size
rel_ptr = raw_ptr + len(buf)
sym_ptr = rel_ptr + nrel * 10
out = bytearray()
out += struct.pack('<HHIIIHH', 0x8664, 1, 0, sym_ptr, 1, 0, 0)
out += struct.pack('<8sIIIIIIHHI', b'.rsrc', 0, 0, len(buf), raw_ptr, rel_ptr, 0, nrel, 0, 0x40000040)
out += buf
for r in relocs:
    out += struct.pack('<IIH', r, 0, 3)  # IMAGE_REL_AMD64_ADDR32NB contra el símbolo de la sección
out += struct.pack('<8sIhHBB', b'.rsrc', 0, 1, 0, 3, 0)
out += struct.pack('<I', 4)  # tabla de cadenas vacía
open('rsrc_windows_amd64.syso', 'wb').write(out)
print('syso', len(out), 'bytes,', n, 'iconos')
