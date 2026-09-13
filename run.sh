#!/usr/bin/env bash
# Chloe 랜딩 배포 — S3 업로드 → CloudFront 무효화 → 응답 확인
set -euo pipefail
cd "$(dirname "$0")"

BUCKET=${BUCKET:-chloe-landing-767371459444}
DIST=${DIST:-E38DRRCLUU5VM7}
URL=https://d1umrfxiy790qx.cloudfront.net

PAGE_CC="public, max-age=300"                        # 카피 수정이 5분 안에 반영되도록 짧게
ASSET_CC="public, max-age=31536000, immutable"       # 이미지는 파일명을 바꿔서 교체

s3() { aws s3 cp "$1" "s3://$BUCKET/$1" --content-type "$2" --cache-control "$3" --only-show-errors; }

echo "▸ 업로드"
for f in *.html; do s3 "$f" "text/html; charset=utf-8" "$PAGE_CC"; done
s3 styles.css "text/css; charset=utf-8"               "$PAGE_CC"
s3 app.js     "application/javascript; charset=utf-8" "$PAGE_CC"
for f in img/*.webp; do s3 "$f" "image/webp" "$ASSET_CC"; done
for f in img/*.png;  do s3 "$f" "image/png"  "$ASSET_CC"; done
# ponytail: 지운 이미지는 S3에 남겨둔다. --delete 는 실수 한 번에 라이브를 깨뜨리고, 남은 파일은 월 몇 센트다.

echo "▸ 무효화"
ID=$(aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*" \
      --query Invalidation.Id --output text)
aws cloudfront wait invalidation-completed --distribution-id "$DIST" --id "$ID"

echo "▸ 확인"
CURL=$(command -v curl || echo /usr/bin/curl)
fail=0
for p in a.html b.html; do
  # -w 끝의 개행이 없으면 read 가 EOF 로 1 을 반환해 set -e 에 걸린다
  read -r code time < <("$CURL" -s -o /dev/null -w '%{http_code} %{time_total}\n' "$URL/$p")
  printf "  %-8s %s  %ss\n" "$p" "$code" "$time"
  [ "$code" = 200 ] || fail=1
done
[ "$fail" = 0 ] || { echo "✗ 배포된 페이지가 200을 주지 않습니다"; exit 1; }

echo "✓ $URL/a.html"
echo "✓ $URL/b.html"
