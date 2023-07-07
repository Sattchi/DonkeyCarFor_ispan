$(function () {
	$('.letter').toggleClass('uppercase');
    var $write = $('#write');
        shift = false;
        capslock = false;
    $('#keyboard li').click(function(){
        //$(this) 当前
        var $this = $(this);
        character = $this.html();
        //shift
        if ($this.hasClass('left-shift') || $this.hasClass('right-shift')) {
            $('.letter').toggleClass('uppercase');
            $('.symbol span').toggle();

            shift = (shift === true) ? false : true;
            capslock = false;
            return false;
        }

        // Caps lock
        //toggleClass() 对设置或移除被选元素的一个或多个类进行切换。
        // 该方法检查每个元素中指定的类。如果不存在则添加类，如果已设置则删除之。这就是所谓的切换效果。
        if ($this.hasClass('capslock')) {
            $('.letter').toggleClass('uppercase');
            capslock = true;
            return false;
        }

        // Delete
        if ($this.hasClass('delete')) {
            var html = $write.html();
            $write.html(html.substr(0, html.length - 1));
            return false;
        }

        // Special characters
        if ($this.hasClass('symbol')) character = $('span:visible', $this).html();
        if ($this.hasClass('space')) character = ' ';
        if ($this.hasClass('tab')) character = "\t";
        if ($this.hasClass('return')) character = "\n";

       
        if ($this.hasClass('uppercase')) character = character.toUpperCase();

        // Remove shift once a key is clicked.
        if (shift === true) {
            //toggle() 方法在被选元素上进行 hide() 和 show() 之间的切换。
            $('.symbol span').toggle();
            if (capslock === false) $('.letter').toggleClass('uppercase');
            shift = false;
        }
        
        $write.html($write.html() + character);
    });
    });