;( function( $, window, undefined ) {
	'use strict';
	$.DropDown = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};
	$.DropDown.defaults = {	// the options
		listNum:0,
		speed : 300,
		easing : 'ease',
		stack : true,// initial stack effect
		delay : 0,// delay between each option animation
		slidingIn : false,
		onOptionSelect : function(opt) { return false; }
	};

	$.DropDown.prototype={
		_init:function(options){
			this.options=$.extend( true, {}, $.DropDown.defaults, options );
			this._layout();
			this._initEvents();
		},
		_layout:function(){
			var self = this;
			this.minZIndex = 1000;
			this._transformSelect();//select 转成 ul
			this.opts=this.listopts.children("li");
			this.optsCount=this.opts.length;
			this.size={width:this.dd.width(),height:this.dd.height()};
			var elName = this.$el.attr( 'name' ), elId = this.$el.attr( 'id' ),
			inputName = elName !== undefined ? elName : elId !== undefined ? elId : 'cd-dropdown-' + ( new Date() ).getTime();
			this.inputEl = $( '<input type="hidden" name="' + inputName + '"></input>' ).insertAfter( this.selectlabel );
			
			this.selectlabel.css( 'z-index', this.minZIndex + this.optsCount );
			this._positionOpts();
			setTimeout( function() { self.opts.css( 'transition', 'all ' + self.options.speed + 'ms ' + self.options.easing ); }, 25 );
			
		},
		_initEvents:function(){						
			var self = this,
				throwHook = this._throwHook;
			
			this.selectlabel.on( 'mousedown.dropdown', function( event ) {
				self.opened ? self.close() : self.open();
				return false;

			} );

			this.opts.on( 'click.dropdown', function() {
				if( self.opened ) {
					var opt = $( this );
					self.options.onOptionSelect( opt );
					self.inputEl.val( opt.data( 'value' ) );
					self.selectlabel.html( opt.html() );
					self.close();
				}
			} );						
		},
		open:function(){
			var self = this;
			this.dd.toggleClass( 'cd-active' );
			this.listopts.css( 'height', ( this.optsCount + 1 ) * ( this.size.height + this.options.listNum ) );
			this.opts.each( function( i ) {

				$( this ).css( {
					opacity:1,
					visibility : 'visible',
					top : ( i + 1 ) * ( self.size.height + self.options.listNum ),
					width : self.size.width,
					marginLeft : 0,
					transitionDelay : self.options.delay? self.options.slidingIn ? ( i * self.options.delay ) + 'ms' : ( ( self.optsCount - 1 - i ) * self.options.delay ) + 'ms' : 0
				} );

			} );
			this.opened = true;
		},
		close:function(){
			var self = this;
			if( this.options.delay ) {
				this.opts.each( function( i ) {
					$( this ).css( { 'transition-delay' : self.options.slidingIn ? ( ( self.optsCount - 1 - i ) * self.options.delay ) + 'ms' : ( i * self.options.delay ) + 'ms' } );
				} );
			}
			this.dd.toggleClass( 'cd-active' );
			this._positionOpts( true );
			this.opened = false;
		},
		_transformSelect:function(){//select 转成 ul
			var optshtml = '', selectlabel = '';
			this.$el.children("option").each(function(){
				var $this = $( this ),
					val = isNaN( $this.attr( 'value' ) ) ? $this.attr( 'value' ) : Number( $this.attr( 'value' ) ) ,
					classes = $this.attr( 'class' ),
					label = $this.text();
					val !==-1?
						classes!==undefined?
							optshtml += '<li data-value="' + val + '"><span class="' + classes + '">' + label + '</span></li>' :
							optshtml += '<li data-value="' + val + '"><span>' + label + '</span></li>' :
					selectlabel=label;		
			});
			this.listopts=$('<ul/>').append(optshtml);
			this.selectlabel=$('<span></span>').append(selectlabel);
			this.dd=$('<div class="cd-dropdown"/>').append(this.selectlabel,this.listopts).insertAfter(this.$el);
			this.$el.remove();			
		},
		_positionOpts : function( anim ) {
			var self = this;
			this.listopts.css( 'height', 'auto' );
			this.opts
				.each( function( i ) {
					$( this ).css( {
						zIndex : self.minZIndex + self.optsCount - 1 - i,
						top : self.options.slidingIn ? ( i + 1 ) * ( self.size.height + self.options.listNum ) : 0,
						left : 0,
						marginLeft : self.options.slidingIn ? i % 2 === 0 ? self.options.slidingIn : - self.options.slidingIn : 0,
						opacity: self.options.slidingIn ? 0 : 1,
						visibility : self.options.slidingIn ? 'hidden' : 'visible',
						transform : 'none'
					} );
				} );

			if( !this.options.slidingIn ) {
				this.opts
					.eq( this.optsCount - 1 )
					.css( { top : this.options.stack ? 9 : 0, left : this.options.stack ? 4 : 0, width : this.options.stack ? this.size.width - 8 : this.size.width, transform : 'none' } )
					.end()
					.eq( this.optsCount - 2 )
					.css( { top : this.options.stack ? 6 : 0, left : this.options.stack ? 2 : 0, width : this.options.stack ? this.size.width - 4 : this.size.width, transform : 'none' } )
					.end()
					.eq( this.optsCount - 3 )
					.css( { top : this.options.stack ? 3 : 0, left : 0, transform : 'none' } );
			}

		},
	};
	
	$.fn.dropdown = function( options ) {
		var instance = $.data( this, 'dropdown' );
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				instance[ options ].apply( instance, args );
			});
		} else {
			this.each(function() {
				instance ? instance._init() : instance = $.data( this, 'dropdown', new $.DropDown( options, this ) );
			});
		}
		return instance;
	};

} )( jQuery, window );
