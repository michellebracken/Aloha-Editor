/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/

define(
['aloha', 'aloha/plugin', 'aloha/jquery', 'aloha/floatingmenu', 'i18n!format/nls/i18n', 'i18n!aloha/nls/i18n', 'aloha/console',
 		'css!format/css/format.css'],
function(Aloha, Plugin, jQuery, FloatingMenu, i18n, i18nCore) {
	"use strict";
	var
		GENTICS = window.GENTICS,
	    pluginNamespace = 'aloha-format';

	/**
	 * register the plugin with unique name
	 */
	return Plugin.create('format', {
		/**
		 * Configure the available languages
		 */
		languages: ['en', 'de', 'fr', 'eo', 'fi', 'ru', 'it', 'pl'],

		/**
		 * default button configuration
		 */
		config: [ 'strong', 'em', 'b', 'i','s','sub','sup', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'removeFormat'],
		/*
		config: { 
					'em': {
						'class': {
							'warn': 'Warning',
							'ok': 'Success',
							'error': 'Error',
						},
						'aloha-data': {}
					},
					'strong': 'big-bold',
					'b': ['big','small'], 
					'i': false,
					'p': [], 
					'h1': {}, 
					'h2': null, 
					'h3': 'subheadline', 
					'removeFormat': true
				},
		
		formatOptions: [],
		//*/

		/**
		 * Initialize the plugin and set initialize flag on true
		 */
		init: function () {
			// Prepare
			var me = this;

			this.initButtons();

			// apply specific configuration if an editable has been activated
			Aloha.bind('aloha-editable-activated',function (e, params) {
				me.applyButtonConfig(params.editable.obj);
			});

			Aloha.ready( function () {
				// @todo add config option for sidebar panel
				me.initSidebar( Aloha.Sidebar.right ); 
			} );

			/*
			Aloha.defaults.supports = jQuery.merge(Aloha.defaults.supports, {
					elements: [ 'strong', 'em', 'b', 'i','del','sub','sup', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre' ]
			});
			*/
		},

		/**
		 * applys a configuration specific for an editable
		 * buttons not available in this configuration are hidden
		 * @param {Object} id of the activated editable
		 * @return void
		 */
		applyButtonConfig: function (obj) {

			var config = this.getEditableConfig(obj),
				button, i, len;

			/*if ( typeof this.config === 'object' ) {
			//window.console.log(config);
			var config_full = config
			config = [];
			jQuery.each(config_full, function(j, button) {
				//window.console.log(j);
				//if ( typeof button === 'object' ) {
					config.push(j);
				//}
			});
			//window.console.log(config);
			}*/
			if ( typeof config === 'object' ) {
				var config_old = [];
				jQuery.each(config, function(j, button) {
					//window.console.log('zzz check', j, button);
					if ( typeof j === 'number' && typeof button === 'string' ) {
						//config_old.push(j);
					} else {
						config_old.push(j);
					}
				});
				
				if ( config_old.length > 0 ) {
					config = config_old;
				}
			}
			this.formatOptions = config;

			//window.console.log('config', config);
			//window.console.log('this.config', this.config);
			//window.console.log('buttons', this.buttons);

			// now iterate all buttons and show/hide them according to the config
			for ( button in this.buttons) {
				if (jQuery.inArray(button, config) != -1) {
					this.buttons[button].button.show();
				} else {
					this.buttons[button].button.hide();
				}
			}

			// and the same for multisplit items
			len = this.multiSplitItems.length;
			for (i = 0; i < len; i++) {
				if (jQuery.inArray(this.multiSplitItems[i].name, config) != -1) {
					this.multiSplitButton.showItem(this.multiSplitItems[i].name);
				} else {
					this.multiSplitButton.hideItem(this.multiSplitItems[i].name);
				}
			}
		},

		/**
		 * initialize the buttons and register them on floating menu
		 * @param event event object
		 * @param editable current editable object
		 */
		initButtons: function () {
			var
				scope = 'Aloha.continuoustext',
				that = this;

			// reset
			this.buttons = {};

			// collect the multisplit items here
			this.multiSplitItems = [];
			//this.multiSplitButton;

			//iterate configuration array an push buttons to buttons array
			jQuery.each(this.config, function(j, button) {
				var button_config = false;

				if ( typeof j !== 'number' && typeof button !== 'string' ) {
					var button_config = button;
					button = j;
				}
//				window.console.log('button', button);
//				window.console.log('b-config', button_config);

				switch( button ) {
					// text level semantics:
					case 'u':
					case 'em':
					case 'strong':
					case 'b':
					case 'i':
					case 'cite':
					case 'q':
					case 'code':
					case 'abbr':
					case 'del':
					case 's':
					case 'sub':
					case 'sup':
						that.buttons[button] = {'button' : new Aloha.ui.Button({
							'name' : button,
							'iconClass' : 'aloha-button aloha-button-' + button,
							'size' : 'small',
							'onclick' : function () {
								var selectedCells = jQuery('.aloha-cell-selected');

									if ( typeof button_config === 'string' ) {
										markup.attr('class', button_config);
									} else if ( typeof button_config === 'object' ) {
									//} else if ( typeof button_config === 'object' ) { // check for class and other html-attr
										markup.attr('class', button_config[0]);
									}

								// formating workaround for table plugin
								if ( selectedCells.length > 0 ) {
									var cellMarkupCounter = 0;
									selectedCells.each( function () {
										var cellContent = jQuery(this).find('div'),
											cellMarkup = cellContent.find(button);
										
										if ( cellMarkup.length > 0 ) {
											// unwrap all found markup text
											// <td><b>text</b> foo <b>bar</b></td>
											// and wrap the whole contents of the <td> into <b> tags
											// <td><b>text foo bar</b></td>
											cellMarkup.contents().unwrap();
											cellMarkupCounter++;
										}
										cellContent.contents().wrap('<'+button+'></'+button+'>');
									});

									// remove all markup if all cells have markup
									if ( cellMarkupCounter == selectedCells.length ) {
										selectedCells.find(button).contents().unwrap();
									}
									return false;
								}
								// formating workaround for table plugin

								that.addMarkup( button ); 
								return false;
							},
							'tooltip' : i18n.t('button.' + button + '.tooltip'),
							'toggle' : true
						}), 'markup' : jQuery('<'+button+'></'+button+'>').attr('class', button_config)};

						FloatingMenu.addButton(
							scope,
							that.buttons[button].button,
							i18nCore.t('floatingmenu.tab.format'),
							1
						);
						break;

					case 'p':
					case 'h1':
					case 'h2':
					case 'h3':
					case 'h4':
					case 'h5':
					case 'h6':
					case 'pre':
						that.multiSplitItems.push({
							'name' : button,
							'tooltip' : i18n.t('button.' + button + '.tooltip'),
							'iconClass' : 'aloha-button ' + i18n.t('aloha-button-' + button),
							'markup' : jQuery('<'+button+'></'+button+'>'),
							'click' : function() {
								var selectedCells = jQuery('.aloha-cell-selected');

								// formating workaround for table plugin
								if ( selectedCells.length > 0 ) {
									var cellMarkupCounter = 0;
									selectedCells.each( function () {
										var cellContent = jQuery(this).find('div'),
											cellMarkup = cellContent.find(button);
										
										if ( cellMarkup.length > 0 ) {
											// unwrap all found markup text
											// <td><b>text</b> foo <b>bar</b></td>
											// and wrap the whole contents of the <td> into <b> tags
											// <td><b>text foo bar</b></td>
											cellMarkup.contents().unwrap();
											cellMarkupCounter++;
										}
										cellContent.contents().wrap('<'+button+'></'+button+'>');
									});

									// remove all markup if all cells have markup
									if ( cellMarkupCounter == selectedCells.length ) {
										selectedCells.find(button).contents().unwrap();
									}
									return false;
								}
								// formating workaround for table plugin

								that.changeMarkup( button );

							}
						});
						break;

					// wide multisplit buttons
					case 'removeFormat':
						that.multiSplitItems.push({
							'name' : button,
							'text' : i18n.t('button.' + button + '.text'),
							'tooltip' : i18n.t('button.' + button + '.tooltip'),
							'iconClass' : 'aloha-button aloha-button-' + button,
							'wide' : true,
							'click' : function() {
								that.removeFormat();
							}
						});
						break;
					//no button defined
					default:
						Aloha.log('warn', this, 'Button "' + button + '" is not defined');
						break;
				}
			});

			if (this.multiSplitItems.length > 0) {
				this.multiSplitButton = new Aloha.ui.MultiSplitButton({
					'name' : 'phrasing',
					'items' : this.multiSplitItems
				});
				FloatingMenu.addButton(
					scope,
					this.multiSplitButton,
					i18nCore.t('floatingmenu.tab.format'),
					3
				);
			}

			// add the event handler for selection change
			Aloha.bind('aloha-selection-changed',function(event,rangeObject){
				// iterate over all buttons
				var
					statusWasSet = false, effectiveMarkup,
					foundMultiSplit, i, j, multiSplitItem;

				jQuery.each(that.buttons, function(index, button) {
					statusWasSet = false;
					for ( i = 0; i < rangeObject.markupEffectiveAtStart.length; i++) {
						effectiveMarkup = rangeObject.markupEffectiveAtStart[ i ];
						if (Aloha.Selection.standardTextLevelSemanticsComparator(effectiveMarkup, button.markup)) {
							button.button.setPressed(true);
							statusWasSet = true;
						}
					}
					if (!statusWasSet) {
						button.button.setPressed(false);
					}
				});

				if (that.multiSplitItems.length > 0) {
					foundMultiSplit = false;

					// iterate over the markup elements
					for ( i = 0; i < rangeObject.markupEffectiveAtStart.length && !foundMultiSplit; i++) {
						effectiveMarkup = rangeObject.markupEffectiveAtStart[ i ];

						for ( j = 0; j < that.multiSplitItems.length && !foundMultiSplit; j++) {
							multiSplitItem = that.multiSplitItems[j];

							if (!multiSplitItem.markup) {
								continue;
							}

							// now check whether one of the multiSplitItems fits to the effective markup
							if (Aloha.Selection.standardTextLevelSemanticsComparator(effectiveMarkup, multiSplitItem.markup)) {
								that.multiSplitButton.setActiveItem(multiSplitItem.name);
								foundMultiSplit = true;
							}
						}
					}

					if (!foundMultiSplit) {
						that.multiSplitButton.setActiveItem(null);
					}
				}
			});

		},


		initSidebar: function ( sidebar ) {
			var pl = this;
			pl.sidebar = sidebar;
			sidebar.addPanel( {

				id       : pl.nsClass( 'sidebar-panel-class' ),
				title    : i18n.t( 'floatingmenu.tab.format' ),
				content  : '',
				expanded : true,
				activeOn : this.formatOptions,

				onInit: function () {
				},

				onActivate: function ( effective ) {
					var that = this;
					that.effective = effective;
					
					if ( !effective[0] ) {
						return;
					}
					that.format = effective[0].nodeName.toLowerCase();

					//window.console.log(effective[0].nodeName.toLowerCase());
					/*
					if ( jQuery( that.effective ).attr( 'target' ) != null ) {
						var isFramename = true;
						jQuery( pl.nsSel( 'framename' ) ).hide().val( '' );
						jQuery( pl.nsSel( 'radioTarget' ) ).each( function () {
							jQuery( this ).removeAttr('checked');
							if ( jQuery( this ).val() === jQuery( that.effective ).attr( 'target' ) ) {
								isFramename = false;
								jQuery( this ).attr( 'checked', 'checked' );
							}
						} );
						if ( isFramename ) {
							jQuery( pl.nsSel( 'radioTarget[value="framename"]' ) ).attr( 'checked', 'checked' );
							jQuery( pl.nsSel( 'framename' ) )
								.val( jQuery( that.effective ).attr( 'target' ) )
								.show();
						}
					} else {
						jQuery( pl.nsSel( 'radioTarget' ) ).first().attr( 'checked', 'checked' );
						jQuery( that.effective ).attr( 'target', jQuery( pl.nsSel( 'radioTarget' ) ).first().val() );
					}
					*/
					
					var dom = jQuery('<div>').attr('class', pl.nsClass( 'target-container' ));
					var fieldset = jQuery('<fieldset>');
					fieldset.append(jQuery('<legend>' + that.format + ' ' + i18n.t( 'format.class.legend' )).append(jQuery('<select>')));
					
					dom.append(fieldset);
					//window.console.log(dom);
					
					var html = 
						'<div class="' + pl.nsClass( 'target-container' ) + '"><fieldset><legend>' + i18n.t( 'format.class.legend' ) + '</legend><select name="targetGroup" class="' + pl.nsClass( 'radioTarget' ) + '">' + 
						'<option value="">' + i18n.t( 'format.class.none' ) + '</option>';
						
						if ( pl.config[that.format] && pl.config[that.format].class ) {
							jQuery.each(pl.config[that.format].class, function(i ,v) {
								html += '<option value="' + i + '" >' + v + '</option>';
							});
						}

						html += '</select></fieldset></div>'

					 var that = this,
						 content = this.setContent(html).content; 

					 jQuery( pl.nsSel( 'framename' ) ).live( 'keyup', function () {
						jQuery( that.effective ).attr( 'target', jQuery( this ).val().replace( '\"', '&quot;' ).replace( "'", "&#39;" ) );
					 } );
					

					var that = this;
					that.effective = effective;
					jQuery( pl.nsSel( 'linkTitle' ) ).val( jQuery( that.effective ).attr( 'title' ) );
				}

			} );

			sidebar.show();
		},

		// duplicated code from link-plugin
		//Creates string with this component's namepsace prefixed the each classname
		nsClass: function () {
			var stringBuilder = [], prefix = pluginNamespace;
			jQuery.each( arguments, function () {
				stringBuilder.push( this == '' ? prefix : prefix + '-' + this );
			} );
			return stringBuilder.join( ' ' ).trim();
		},

		// duplicated code from link-plugin
		nsSel: function () {
			var stringBuilder = [], prefix = pluginNamespace;
			jQuery.each( arguments, function () {
				stringBuilder.push( '.' + ( this == '' ? prefix : prefix + '-' + this ) );
			} );
			return stringBuilder.join( ' ' ).trim();
		},




		/**
		 * Removes all formatting from the current selection.
		 */
		removeFormat: function() {
			var formats = [ 'strong', 'em', 'b', 'i', 'cite', 'q', 'code', 'abbr', 'del', 'sub', 'sup'],
				rangeObject = Aloha.Selection.rangeObject,
				i;
			
			// formats to be removed by the removeFormat button may now be configured using Aloha.settings.plugins.format.removeFormats = ['b', 'strong', ...]
			if (this.settings.removeFormats) {
				formats = this.settings.removeFormats;
			}

			if (rangeObject.isCollapsed()) {
				return;
			}

			for (i = 0; i < formats.length; i++) {
				GENTICS.Utils.Dom.removeMarkup(rangeObject, jQuery('<' + formats[i] + '></' + formats[i] + '>'), Aloha.activeEditable.obj);
			}

			// select the modified range
			rangeObject.select();
			// TODO: trigger event - removed Format

		},

		/**
		* toString method
		* @return string
		*/
		toString: function () {
			return 'format';
		}
	});
});
