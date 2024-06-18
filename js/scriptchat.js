// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase リアルタイムデータベースに接続
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// chatという階層にデータを格納
const dbRef = ref(database, "chat");


// 関数に名前つける　サインアップの独自関数
function signUpUser(email, password) {
   // 認証機能つかうとき必ずつかう
   const auth = getAuth();
   console.log(email,password,2); //処理の流れの確認用
   // ↓メール・パス認証のいろんな処理をたった一行でできる
   createUserWithEmailAndPassword(auth, email, password)
   // 登録成功後にやりたいことをここに書く
     .then(function (userInfo) {
       console.log("サインアップ成功:", userInfo);
       location.href = "indexchat.html";
     })
     // 登録失敗とかエラーのときにやりたいことをここに書く
     .catch(function (error) {
       console.log(error);
       $('#message').html(error);
     });
}


// 新規登録（サインアップ）ボタンを押したら
// .val 覚えといてね、あとで使うから
$('#signup-button').on('click', function() {
  const email = $("#signup-email").val();
  const password = $("#signup-password").val();
  console.log(email,password,1); //処理の流れの確認用
  signUpUser(email, password);
});

// ログイン処理を担当する独自関数
function loginUser(email, password) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
  // ログイン成功時にやりたいこと
  .then(function(userInfo) {
    console.log(userInfo);
    // アドレスバーに対して画面設定
    location.href = "indexchat.html";
// ログイン失敗、エラーのときにやりたいこと
  })
  .catch(function(error) {
    console.log(error);
    $('#message').html(error);
  })
}

// ログインボタンを押したときの処理
$('#login-button').on('click', function() {
  const email = $("#login-email").val();
  const password = $("#login-password").val();
  loginUser(email,password);
});

// ログアウト処理する独自関数
function logoutUser() {
  const auth = getAuth();
  signOut(auth)
  .then(function() {
    location.href = "login.html";
  })
  .catch(function(error) {
    console.log(error);
    $('#message').html(error);
  });
}

// ログアウトボタン押したら
$('#logout-button').on('click', function() {
  logoutUser();
});


// データ取得の独自関数
function sendMessageToDatabase() {
  // 入力欄のデータを取得
  const userName = $('#userName').text();
  const text = $('#text').val();
  // 現在の日時を取得
  const timestamp = new Date();
  // 日時を適切なフォーマットに整形
  const formattedDate = timestamp.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
// コンソールで流れを確認 どのなみかっこの中にあるかチェック！
  console.log('ちゃんとフォームから値取得できたか', userName, text, timestamp);

  // 送信データをオブジェクトにまとめる
  const message = {
    userName: userName,
    text: text,
    timestamp: formattedDate
  };

  // firebase realtime databaseにオブジェクト送信
  // ユニークキーを生成してデータが入る
  const newPostRef = push(dbRef);
  set(newPostRef, message);

 // 入力欄をクリア
 $('#text').val('');
}

// 送信ボタンを押したときの処理
$('#send').on('click',sendMessageToDatabase);

// Enterキーを押してもメッセージを追加する関数
function enterKeyToAddMessage() {
// enterキー押しても追加
$('#text').on('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // デフォルトのEnterキーの挙動を無効化
    $('#send').click(); // 送信ボタンをクリック
  }
});
}

// Enterキーを押してもメッセージを追加する処理を有効化
enterKeyToAddMessage();

// チャットにメッセージを追加する関数
function addMessageToChat(data) {
// 追加されたデータをFirebaseから受け取り、分解
// ルールに則った分解方法　コンソールで中身確認を徹底
const message = data.val();
const key = data.key;

// ユーザーがログインしているかどうかを確認
const auth = getAuth();
const user = auth.currentUser;
const loggedInUserEmail = user ? user.email : null;

// メールアドレスが一致するかどうかをチェック
const isCurrentUser = message.userName === loggedInUserEmail;


let chatMsg = `
 <div class="chat ${isCurrentUser ? 'right' : 'left'}"> 
  <div class="message-wrapper">
    <div class="message">
      <div>${message.userName}</div> 
      <div>${message.text}</div> 
      <div>${message.timestamp}</div> 
    </div>
    <div>
      <button class="delete" data-key="${key}">削除</button>
    </div>
  </div>
</div>
`;

  $('#output').append(chatMsg);
}

// データが追加されたときに呼び出す
onChildAdded(dbRef, addMessageToChat);


const auth = getAuth();
const useremailElement = document.getElementById("userName");
onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email;
    // ユーザーがログインしている場合の処理
    useremailElement.textContent = `${email}`; // emailを表示要素にセット
  } else {
    // ユーザーがログインしていない場合の処理
    useremailElement.textContent = "ユーザーはログインしていません";
  }
});


  $(document).on('click', '.delete', function() {
    const key = $(this).data('key'); // ボタンに設定したdata属性からキーを取得
    console.log('Delete button clicked with key:', key);
  
    // データベースからエントリを削除
    remove(ref(database, `chat/${key}`));
    // 対応するHTML要素も削除
    $(this).closest('.chat').remove();
  });
