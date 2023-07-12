function tempAlert(title='訊息', msg='', type='primary', duration=3000, note='') {
    var el = document.createElement("div");
    $(el).attr("style", "position: absolute;top: 10%;left: 30%;width: 50%;")
    el.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">\n<h4 class="alert-heading">'+title+'</h4><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n<p>' + msg + '</p>\n'+((note)?'<hr>\n<p class="mb-0">'+ note +'</p>\n':'') +'</div>';
    // $(el).addClass("alert")
    // el.innerHTML = '<span class="closebtn" onclick="this.parentElement.style.display=\'none\';">&times;</span>'+msg;
    console.log(msg);
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
}