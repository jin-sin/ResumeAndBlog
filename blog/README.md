# 블로그 포털

마크다운으로 글을 작성하고 볼 수 있는 간단한 블로그 포털입니다.

## 사용 방법

1. `/blog/index.html` - 블로그 메인 페이지 (글 목록 및 읽기 기능)
2. `/blog/login-helper.html` - 관리자 보안 URL 생성기 (최초 1회 실행)
3. 생성된 관리자 URL (예: `/blog/admin.html?key=xxxx`) - 글 작성, 수정, 삭제 가능

## 보안 설정 방법

1. `/blog/login-helper.html`을 브라우저에서 열고 비밀번호를 설정합니다.
2. 생성된 설정 코드를 `/blog/js/auth-config.js` 파일에 붙여넣습니다.
3. 생성된 관리자 URL을 북마크에 저장하여 안전하게 보관합니다.
4. `/blog/login-helper.html` 파일은 외부에 노출되지 않도록 설정 후 삭제하거나 보안 처리합니다.

## 파일 구조

- `/blog/index.html` - 블로그 메인 페이지
- `/blog/admin.html` - 관리자 페이지 (보안 URL로만 접근 가능)
- `/blog/js/` - 자바스크립트 파일들
  - `blog.js` - 블로그 메인 기능
  - `admin.js` - 관리자 기능
  - `markdown.js` - 마크다운 렌더링
  - `storage.js` - 데이터 저장 관련 기능
  - `auth.js` - 인증 관련 유틸리티
  - `auth-config.js` - 인증 설정 (버전 관리에서 제외됨)
- `/blog/posts/` - 마크다운 포스트 샘플 파일들

## 기술 스택

- HTML, CSS, JavaScript (바닐라)
- Marked.js (마크다운 파싱)
- localStorage (데이터 저장)
- Web Crypto API (비밀번호 해싱)