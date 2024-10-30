(function(){
    'use strict';
    // alert('JSが動きました！\nJSはsrc/index.jsに書いてありますので編集してください。');
})();



//https://note.com/mad1618s/n/nf0f7a0160c1d//
function setVw(){
    //--vwをセットする関数
    
      let vw = $(window).width() / 100 + 'px';
      //ブラウザ幅/100を取得し変数vwに格納
    
      $(':root').css('--vw', vw);
      //:rootのカスタムプロパティ--vwにvwを代入させる。これで、スクロールバーの幅を除いた画面幅/100が--vwになる
    }
    
    $(window).on('load resize', function(){
      setVw;
    });
    //画面を、読み込んだ時・サイズを変えた時  →  関数vwが動作する