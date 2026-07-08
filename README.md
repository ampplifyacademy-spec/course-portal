# Course Portal

Static site (GitHub Pages) + Firebase (Auth + Firestore). ব্যাংকে টাকা পাঠায়ে সাইনআপ করবে ইউজার, admin approve করলে Google Drive কোর্স লিংক দেখবে।

## Setup

1. **Firebase project বানাও**: https://console.firebase.google.com → Add project (free)
2. **Auth চালু করো**: Build > Authentication > Sign-in method > Email/Password enable
3. **Firestore চালু করো**: Build > Firestore Database > Create database (production mode)
4. **Rules বসাও**: Firestore > Rules ট্যাবে `firestore.rules` এর কন্টেন্ট পেস্ট করো, নিজের admin ইমেইল বসাও
5. **Web app যোগ করো**: Project settings > Your apps > Web (</>) → config কপি করে `js/firebase-config.js` এ বসাও, `ADMIN_EMAILS`-এ নিজের ইমেইল বসাও

## Drive লিংক

Google Drive ফোল্ডার/ফাইল "Anyone with the link" (viewer) করে link কপি করো, admin panel দিয়ে কোর্স হিসেবে যোগ করো। Approve করা স্টুডেন্টই লিংক দেখবে (কিন্তু লিংক leak হলে বাইরের কেউও খুলতে পারবে — বেশি secure দরকার হলে Drive API দিয়ে per-user share করতে হবে, এটা পরের ধাপ)।

## GitHub Pages এ হোস্ট

```
git init
git add .
git commit -m "init course portal"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```
তারপর repo Settings > Pages > Branch: main, Save. কিছুক্ষণ পর `https://USERNAME.github.io/REPO/` এ লাইভ।

## Local এ টেস্ট
যেকোনো static server চালাও, যেমন:
```
npx serve .
```
