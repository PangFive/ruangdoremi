window.initVideo=function(){var e,o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=o.el,d=void 0===t?"ytEmbed":t,n=o.videoId,i=(o.httpMethod,o.httpUrl,o.httpPayload,o.watchSeconds,document.createElement("script"));function a(o){window.player=e}i.src="https://www.youtube.com/iframe_api",document.body.appendChild(i),window.onYouTubeIframeAPIReady=function(){e=new YT.Player(d,{videoId:n,playerVars:{autoplay:!1,modestbranding:1,rel:0,showinfo:0,ecver:2},events:{onReady:a}})}};