from pathlib import Path
import base64
import hashlib
import shutil
import zipfile

root = Path(__file__).resolve().parent
target = "50c9bc778c3c68745b779bd9f26c3be9d70398d7a3a3ff41ff626db41cebb9bc"

prefix = "".join((root / f"source.b64.{i:02d}").read_text().strip() for i in range(7))
old_tail = (root / "source.b64.07.full").read_text().strip()
tail = old_tail[:2688] + "".join((root / f"source.b64.07.tail{i}").read_text().strip() for i in range(4))

data = base64.b64decode(prefix + tail, validate=True)
actual = hashlib.sha256(data).hexdigest()
if actual != target:
    raise SystemExit(f"Source checksum mismatch: {actual}")

zip_path = root / "ellie-verified.zip"
zip_path.write_bytes(data)
out = root / "restored"
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)

with zipfile.ZipFile(zip_path) as z:
    bad = z.testzip()
    if bad:
        raise SystemExit(f"ZIP integrity failure: {bad}")
    z.extractall(out)

print(out / "Ellie-Paths-of-Grace-CrossPlatform")
