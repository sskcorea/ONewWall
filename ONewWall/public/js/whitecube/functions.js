var mouse_scroll = false;
var resize_timer;
var loader_timer;
var loader_delay = 400;
var loader_opts = {
    lines: 12,
    length: 6,
    width: 2,
    radius: 8,
    color: '#BBBBBB',
    speed: 1.2,
    trail: 100,
    shadow: false
}
var switching_content = false;
var content_transition = 200;
var init_url = window.location.href;
var first_load = true;
var content_area;
var body;
var footer;
var transitions = Modernizr.csstransitions;
var getPrefix = Modernizr.prefixed('transform') || false;
var prefix;
getPrefix ? prefix = getPrefix.replace(/([A-Z])/g, function(getPrefix,m1){return '-' + m1.toLowerCase();}).replace(/^ms-/,'-ms-').replace('transform','') : transitions = false;
var transform_key = prefix+"transform";
var transform_origin_key= prefix+"transform-origin";

var ieversion = 100;
if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
    ieversion = Number(RegExp.$1);
}

function showLoader(selector, position) {
    var target = $(selector);
    var wrapper = $('<div class="loader" />');
    var properties = {};
    switch (position) {
        case "middle":
            properties = {'top':'50%','left':'50%'};
            break;
        case "topleft":
            properties = {'top':'16px','left':'16px'};
            break;
    }
    wrapper.css(properties);
    target.append(wrapper);
    wrapper.spin(loader_opts);
    loader_timer = setTimeout(function() {
        wrapper.animate({'opacity':'1'}, 200);
    }, loader_delay);
}

function hideLoader(selector) {
    clearTimeout(loader_timer);
    loader_timer = null;
    var target = $(selector);
    var wrapper = $('.loader', target);
    wrapper.stop().animate({'opacity':'0'}, 200, function() {
        wrapper.spin();
        wrapper.remove();
    });    
}

// IE friendly clone function
function cloneObject(obj) {
    if (!obj || !obj.length) {return false;}
    var type = obj.get(0).tagName;
    var classes = obj.attr('class');
    var html = obj.html();
    var new_el = document.createElement(type);
    var new_obj = $(new_el);
    new_obj.addClass(classes);
    new_obj.html(html);
    
    return new_obj;
}

/*function maxWidth(els) {
    if (ieversion > 6) { return false; }
    els.each(function() {
        var t = $(this);
        var p = t.parent();
        var mw = p.width();
        if (mw > 0 && t.width() > mw) {
            t.css({'width':mw+'px'});
        }
    });
}*/

/**
 * Logic for defining cycling between tabbed items
 */
function tabSet(tab_set) 
{
    //Constants
    var animating = false;
    var transition = 250;
    var slide_duration = 3000 + (2*transition);
    var slide_timer = null;
    var nested = false;

    var slide_index = 0;
    var group_index = 0;

    var autoplay = tab_set.hasClass('autoplay');
    
    var tabs = $('.tab-panel', tab_set);
    
    //var first_tab = tabs.first();
    
    var first_tab = $('.active-tab', tab_set);
    if (!first_tab.length) first_tab = tabs.first();
    
    var nav_wrapper = $('<ul class="tab-set-nav clearfix" />');
    tab_set.prepend(nav_wrapper);
    
    tabs.not(first_tab).hide().css({'opacity':'0'});
    first_tab.addClass('active-tab');

    //Each tab has certain logic assigned to it    
    tabs.each(function(index) { 
        var heading = $('.tab-panel-header', this);
        var heading_text = $('h1', heading).text();
        var nav_item = $('<li class="a">'+heading_text+'</li>');
        var slides = $('.slide', this);
        heading.remove();
        nav_wrapper.append(nav_item);
        
        if ($(this).hasClass('active-tab')) nav_item.addClass('active-nav');

        /*if (index == 0)
        {
            nav_item.addClass('active-nav');
        }*/

        var first_slide = slides.first();
        first_slide.addClass('active-slide');
        slides.not(first_slide).hide().css({'opacity':'0'});

        //Handle forcing a switch to a certain tab
        nav_item.click(function(){
            var t = $(this);
            if (animating || t.hasClass('active-nav')) {return false;}
            clearTimeout(slide_timer);
            slide_timer = null;
            
            tabSwitch($(this).index());
            $.ajax(base_url+'shop/set_section/'+$(this).text());
        });
    });
    
    function slideSwitch(slide_set) //Handle changing between individual items in a deck
    {
        var slide_set_index = slide_set.index() - 1;
        var count = slide_set.children('.slide').length;

        slide_index++;

        if (tabs.length > 1 && (count == 1 || slide_index >= count))
        {
            tabSwitch()
            return;
        }
        else if (tabs.length == 1 && slide_index >= count)
        {
            slide_index = 0;
        }

        //Do the actual slide transition
        animating = true;
        var new_slide = slide_set.children('.slide').filter(':eq(' + slide_index + ')');
        $('.active-slide', slide_set).animate({'opacity':'0'}, transition, function() {
            $(this).hide().removeClass('active-slide');
            new_slide.addClass('active-slide');
            new_slide.show().animate({'opacity':'1'}, transition, function() {
                animating = false;
                clearTimeout(slide_timer);
                if (autoplay) {
                    slide_timer = setTimeout(function(){slideSwitch(slide_set)}, slide_duration);
                }
            });
        });
    }
   
    //Switch between tabs 
    function tabSwitch(index)
    {
        if (clicked) return false;
        count = tabs.length;

        slide_index = 0; //Always reset which tab is active

        if (index != undefined)
        {
            group_index = index;
        }
        else
        {
            ++group_index;
            if (group_index >= tabs.length) //Increment which group we're looking at
            {
                group_index = 0;
            }
        }

        //Initialize which slide is viewable?
        var slide_set = tabs.filter(':eq('+group_index+')');
        $('.active-slide', slide_set).css({'opacity':'0'}).removeClass('active_slide');
        slide_set.children('.slide').filter(':eq(0)').addClass('active-slide').show().css({'opacity':'1'});

        clearTimeout(slide_timer);

        var active = $('.active-tab', tab_set);
        var active_nav = $('.active-nav', tab_set);

        animating = true;
 
        active.animate({'opacity':'0'}, transition, function() {
            //First, hide the active one
            active.hide().removeClass('active-tab');
            active_nav.removeClass('active-nav');
            $('.a', nav_wrapper).filter(':eq(' + group_index + ')').addClass('active-nav'); 
            var new_tab = tabs.filter(':eq(' + group_index + ')');
            new_tab.addClass('active-tab');
            new_tab.show().animate({'opacity':'1'}, transition, function() {
                animating = false;
                slideShow(new_tab, true);
            });
        });
    }
    
    /*
     * Start a tab-based slideshow
     */
    function slideShow(slide_set) 
    {
        index = 0;
        var slide_set_slides = slide_set.children('.slide');
        var count = slide_set_slides.length;
        
        $('.active-slide', slide_set).removeClass('active-slide');
        slide_set_slides.first().addClass('active-slide');

        var switch_function = null;

        if (count > 1) //We have multiple images
        {
            switch_function = function(){
                slideSwitch(slide_set);
            };
        }
        else
        {
            switch_function = function(){
                tabSwitch();
            };
        }

        clearTimeout(slide_timer);

        if (autoplay) {
            slide_timer = setTimeout(switch_function, slide_duration);
        }

    }
    
    $(window).load(function() {
        if (autoplay)
        {
            if (tabs.length==1 && $('.slide', tabs).length==1)
            {
                return; //Skip if we've got just one item
            }
            
            slideShow(first_tab, true);
        }
    });    
    
}

function initScrollpane(t) {
    var scroll_on = $('.panel-scrollpane', t).attr('data-scroll');
    if (touch && scroll_on) {
        var clip = $('.ui-scrollview-clip', t);
        var view = $('.ui-scrollview-view', t);
        var thumb = $('.ui-scrollbar-thumb', t);
        clip_height = clip.height();
        view_height = view.height();
        thumb_height = (clip_height >= view_height ? "100%" : Math.floor(clip_height/view_height*100)+ "%");
        thumb.css({'height':thumb_height});
    }
    else if (!touch && scroll_on && ieversion>8) {
        mouse_scroll = true;
        var scrollbar = $('<div class="ui-scrollbar ui-scrollbar-y"><div class="ui-scrollbar-track"><div class="ui-scrollbar-thumb"><div class="ui-scrollbar-end"></div></div></div></div>');
        t.addClass('tiny-scrollbar');
        t.append(scrollbar);
        t.tinyscrollbar();
    }

    if (t.parent('.panel').hasClass('active-panel') == false)
    {
        t.css({'display':'none'});
    }
}

function accordion(accordion, expanded_height, collapsed_height) {
    var animating = false;
    var content_height = expanded_height - 29; // panel-inner + panel-heading height
    var panels = $('.panel', accordion);
    var toggle = $('.panel-heading', accordion);
    var transition = 400;
    var panel_count = panels.length;
    var min_height = (panel_count*collapsed_height) + (expanded_height-collapsed_height);
    
    accordion.css({'min-height':min_height+"px"});
    $('.panel-scrollpane', panels).css({'height':content_height+"px"});
    $('.panel-content', panels).css({'min-height':content_height+"px"});
    panels.last().addClass('last');

    //Initialize all of the panels
    panels.each(function(index) {
        var t = $(this);
        var panel_inner = $('.panel-inner', t);
        if (t.hasClass('extra-offset')) {
            t.data('offsetTop',index*collapsed_height+(collapsed_height*2));
        }
        else {
            t.data('offsetTop',index*collapsed_height);
        }
        t.css({'position':'absolute','top':t.data('offsetTop')+"px"});

        if (! t.hasClass('active-panel'))
        {
            panel_inner.css({'opacity':'0'});
        }

        $(window).load(function() {
            initScrollpane(panel_inner);
        });
    });
    
    function openPanel(t) {
        var panel = t.parent();
        if (panel.hasClass('no-expand')) {return true;}
        if (animating) {return false;}
        animating = true;
        var siblings;
        var length;
        var current_active = null;
        
        if ($('.active-panel', accordion).length) {
            current_active = $('.active-panel', accordion);
        }
        
        t.toggleClass('active');   
        // If panel is active, deactivate it
        if (panel.hasClass('active-panel')) {
            $('.panel-inner', panel).animate({'opacity':'0'}, (transition/2), function() {
                $(this).hide();
                if (panel.hasClass('last')) {
                    panel.removeClass('active-panel');
                    animating = false;
                }
                else {
                    siblings = panel.nextAll();
                    length = siblings.length;
                    siblings.each(function(index) {
                        var el = $(this);
                        el.animate({'top':el.data('offsetTop')+"px"}, transition, function() {
                            if (index==length-1) {
                                panel.removeClass('active-panel');
                                animating = false;
                            }                            
                        });
                    });
                }
            })                        
        }
        
        // Active panel
        else {
            // If another panel is active
            if (current_active) {
                $('.panel-heading', current_active).toggleClass('active');
                $('.panel-inner', current_active).animate({'opacity':'0'}, (transition/2), function() {
                    $(this).hide();
                    if (current_active.index()==panels.length-1) {
                        current_active.removeClass('active-panel');
                        activate();
                    }
                    else {
                        siblings = current_active.nextAll();
                        length = siblings.length;
                        siblings.each(function(index) {
                            var el = $(this);
                            el.animate({'top':el.data('offsetTop')+"px"}, transition, function() {
                                if (index == length-1) {
                                    current_active.removeClass('active-panel');
                                    activate();
                                }
                            });
                        });
                    }
                });
            }
            // If first time
            else {
                activate();
            }                        
        }
        
        function activate() {
            if (panel.hasClass('last')) {
                $('.panel-inner', panel).show().animate({'opacity':'1'}, (transition/2), function() {
                    panel.addClass('active-panel');
                    animating = false;
                });
            }
            else {
                siblings = panel.nextAll();
                length = siblings.length;
                siblings.each(function(index) {
                    var el = $(this);
                    el.animate({'top':(expanded_height+el.data('offsetTop'))+"px"}, transition, function() {
                        if (index == length-1) {
                            $('.panel-inner', panel).show().animate({'opacity':'1'}, (transition/2), function() {
                                panel.addClass('active-panel');
                                animating = false;
                            });
                        }                        
                    });
                })
            }            
        }        
    }
    
    toggle.click(function() {
        openPanel($(this));
    });

    //Sort out their positions
    $(window).load(function() {
        var chosen_panel = panels.filter('.active-panel'),
            siblings = chosen_panel.nextAll(),
            length = siblings.length;

        siblings.each(function(index) {
            var el = $(this);
            el.css('top', expanded_height+el.data('offsetTop')+'px');
        });

    });
}

function channelAccordion(accordion) {
    var animating = false;
    var expanded_height = 440;    
    var collapsed_height = 108;
    var panels = $('.panel', accordion);
    var toggle = $('.panel-heading', accordion);
    var panel_count = panels.length;
    var min_height = (panel_count*collapsed_height) + (expanded_height+collapsed_height);
    var transition = 800;
    var scale_props = {};
    var translate_props = {};
    var container_offset = accordion.offset().top;
    
    accordion.css({'min-height':min_height+"px"});
    
    // init
    panels.each(function(index) {
        var t = $(this);
        var panel_inner = $('.panel-inner', t);
        var offset = index * collapsed_height;
        t.data('offsetTop',offset);
        t.data('open', false);
        transitions ? scale_props[transform_key] = 'scale(0.2)' : scale_props['width'] = "20%";
        
        $('.featured .text', t).css({'opacity':'0','display':'none','visibility':'hidden'});
        $('.featured-image', t).css(scale_props);
//        t.css({'height':collapsed_height+"px"});
        panel_inner.css({'opacity':'0'});
        t.css({'position':'absolute','top':(offset)+"px"});       
       
        //Handle clicking 
        $('.panel-heading, .featured-image', t).click(function() {
            if (! t.hasClass('active-panel'))
            {
                panelSwitch(t);
            }
        }); 

        //Override URL
        $('a', t).click(function() {
            var active_check = t.hasClass('active-panel');
            if (!active_check || animating) {
                return false;
            }
        });   

        $(window).load(function() {
            initScrollpane(panel_inner);
        });
    });
    
    function sequenceComplete() {
        animating = false;
    }
    
    function panelSwitch(new_panel) {
        if (animating) {return false;}
        animating = true;
        
        var current_panel = $('.active-panel', accordion);
        var siblings = current_panel.nextAll();
        var init = Boolean(current_panel.length);
        
        var closePanel = function(callback) {
        
            current_panel.data('open', false);
                    
            function scaleImageDown() {
                var featured_image = $('.featured-image', current_panel);
                if (transitions) {
                    
                    featured_image.addClass('scale');
                    translate_props[transform_key] = 'scale(0.2)';
                    featured_image.css(translate_props);
                    translate_props[transform_key] = 'translate(0px,0px)';
                    siblings.css(translate_props);                 
                    
                    setTimeout(function() {
                        current_panel.css({'height':collapsed_height+"px"});    
                    }, transition);
                }
                else {
                    siblings.each(function() {
                        var t = $(this);
                        var offset = t.data('offsetTop');
                        t.animate({'top':offset+"px"}, transition);
                    });
                    featured_image.animate({'width':'20%'}, transition, function() {
                        current_panel.css({'height':collapsed_height+"px"});
                    });
                }
            }
            
            var to_hide = $('.featured .text, .panel-inner', current_panel);
            to_hide.each(function(index) {
                var t = $(this);
                t.animate({'opacity':'0'}, transition/2, function() {
                    t.css({'display':'none'});
                    if (index==to_hide.length-1) {
                        scaleImageDown();
                        callback ? callback() : sequenceComplete();
                    }
                });
            });
        };
        
        var openPanel = function() {
            new_panel.addClass('active-panel');
            new_panel.css({'height':''});
            
            // Show new panels content
            function showContent() {
                var to_show = $('.featured .text, .panel-inner', new_panel);
                to_show.css({'display':'block','visibility':'visible'}).animate({'opacity':'1'}, transition/2, function() {
                    sequenceComplete();
                    new_panel.data('open', true);
                });
            }
            
            // Move following panels
            var siblings = new_panel.nextAll();      
            siblings.each(function() {
                var t = $(this);
                
                if (transitions) {
                    translate_props[transform_key] = 'translate(0px,'+(expanded_height-collapsed_height)+"px"+')';
                    t.css(translate_props);
                }
                else {
                    var offset = t.data('offsetTop');
                    t.stop().animate({'top':offset+expanded_height-collapsed_height+"px"}, transition);
                }                
            });   
            
            function scaleImageUp() {
                var featured_image = $('.featured-image', new_panel);
                // Scale image up
                if (transitions) {
                    featured_image.addClass('scale');
                    translate_props[transform_key] = 'scale(1)';
                    featured_image.css(translate_props);
                    setTimeout(showContent, transition);
                }
                else {
                    featured_image.animate({'width':'100%'}, transition, showContent);
                }
            }
            
            //body.animate({scrollTop: container_offset+new_panel.data('offsetTop')+"px"}, transition, 'easeInOutQuad');
            scaleImageUp();           
        };
        
        // Cases
        if (!init) {
            new_panel.addClass('active-panel');
            openPanel();
        }
        else if (new_panel.hasClass('active-panel')) {
            new_panel.removeClass('active-panel');
            closePanel(false);
        }
        else {
            current_panel.removeClass('active-panel').data('open',false);
            new_panel.addClass('active-panel');
            closePanel(openPanel);
        }
    }
    
    $(window).load(function() {
        setTimeout(function() {
            panelSwitch(panels.first());
        }, 800);
    });
    
}

function contentTransitionOut(callback, data) {
    //footer.animate({'opacity':'0'}, content_transition);
    footer.hide();
    if (body.scrollTop()>0) {
        body.animate({scrollTop: 0}, 300, function() {
            content_area.animate({'opacity':'0'}, content_transition, function() {
                callback(data);
            });
        });
    }
    else {
        content_area.animate({'opacity':'0'}, content_transition, function() {
            callback(data);
        });
    }
}

function contentTransitionIn() {
    //footer.animate({'opacity':'1'}, content_transition);
    content_area.animate({'opacity':'1'}, content_transition, function() {
        switching_content = false;
        footer.show();
    });
}

function viewerInit() {
    
    var viewer = $('<div id="image_viewer" />');
    var enlarge_button = $('<div class="enlarge" data-src="" />');
    var picker = $('#image_picker');
    var picker_sets = $('.image-set', picker);
    var first_time = true;
    var item_tracker = {'set_index':0,'item_index':0};
    var total_sets = picker_sets.length;
    var total_items = $('.image-item', picker).length;
    var video_player = null;
    
    picker_sets.each(function() {
        var t = $(this);
        var items = $('.image-item', t);
        var first_item = items.first();
        t.data('set_item_count',items.length);
        items.not(first_item).hide();
    });
    
    var imageSwitch = function(data) {
        viewer.show();
        viewer.find('.image-item').remove();
        var set_index = data.set_index || 0;
        var item_index = data.item_index || 0;
        var set = picker_sets.eq(set_index);
        var picker_item = $('.image-item', set).eq(item_index);
        var cloned_item = picker_item.clone();
        var cloned_caption = $('figcaption', cloned_item);
        var cloned_img = $('img', cloned_item);
        var main_img_src = cloned_img.attr('data-main');
        var title = set.attr('data-section-title');

        enlarge_button.removeClass('show');

        viewer.unbind().bind('mouseover', function() {
            if (!cloned_img.attr('data-large') == "")
            {
                enlarge_button.addClass('show');
            }
        }).bind('mouseout', function() {
            enlarge_button.removeClass('show');
        });

        if (!cloned_img.attr('data-large') == "")
        {
            enlarge_button.attr('data-src', cloned_img.attr('data-large'));
        }
        else
        {
            enlarge_button.attr('data-src', "");
        }
        
        if (total_items > 1) {
                
            var indicator = $('<div class="indicator clearfix"><p>'+ title + ': <span class="indicator-current">' + (item_index+1) + "</span> / " + picker_sets.eq(set_index).data('set_item_count') +'</p><div class="navigation"><div class="navigation-prev"></div><div class="navigation-next"></div></div></div>');
            cloned_caption.append(indicator);
    
            $('.navigation div', indicator).click(function() {
                if (switching_content) {return false;}
                switching_content = true;
                var t = $(this);
                t.hasClass('navigation-next') ? viewerNavigator(1) : viewerNavigator(-1);
            });        
        }
        
        showLoader(content_area.parent(), "topleft");
        viewer.append(cloned_item);
        cloned_img.attr('src','');
        cloned_img.bind('load', function() {
            //maxWidth(cloned_img);
            cloned_item.css({'display':'block'});
            hideLoader(content_area.parent());
            // Image click navigation
            cloned_item.click(function() {
                if (switching_content || total_items < 2) {return false;}
                switching_content = true;
                viewerNavigator(1);
            });
            contentTransitionIn();
        });
        if (ieversion > 8) {
            cloned_img.attr('src',main_img_src);
        }
        else {
            cloned_img.attr('src',main_img_src+'?'+new Date().getTime());
        }
    };
    
    function viewerNavigator(step) {
        var set_count = picker_sets.eq(item_tracker.set_index).data('set_item_count');
        item_tracker.item_index += step;
        
        // Backwards
        if (step<0) {
            // If no previous item go back to previous set
            if (item_tracker.item_index == -1) {
                item_tracker.set_index += step;
                // If no previous set, go to last item in last set
                if (item_tracker.set_index == -1) {
                    item_tracker.set_index = total_sets-1;
                }
                item_tracker.item_index = picker_sets.eq(item_tracker.set_index).data('set_item_count')-1;
                activeSwitch(picker_sets.eq(item_tracker.set_index));
            }
        }
        // Forwards
        if (step>0) {
            // If no next item, go to first item in next set
            if (item_tracker.item_index == set_count) {
                item_tracker.set_index += step;
                item_tracker.item_index = 0;
                activeSwitch(picker_sets.eq(item_tracker.set_index));
            }
            // If no next set, go to first item in first set
            if (item_tracker.set_index == total_sets) {
                item_tracker.set_index = 0;
                item_tracker.item_index = 0;
                activeSwitch(picker_sets.eq(item_tracker.set_index));
            }
        }
        contentTransitionOut(imageSwitch, item_tracker);
    }
    
    function activeSwitch(new_active) {
        $('.active', picker).removeClass('active');
        new_active.addClass('active');
    }

    function childFilms()
    {
        //Check we have somewhere to stick them.
        //Check we have Films that do this.
        var image_viewer = $('#image_viewer'),
            films = $('.child-film'),
            active_film = null;

        if (image_viewer.length && films.length)
        {
            //Let's do it
            films.each(function(index, item) {
                item = $(item);
                item.children('a').click(function(event) {
                    event.preventDefault();
                    if (active_film != item.data('async-url'))
                    {
                        contentTransitionOut(function() {
                            viewer.empty();
                            showLoader(content_area.parent(), "topleft");
                            /* Request the Video player from the server */
                            $.ajax(item.data('async-url'), {
                                dataType: 'html',
                                success: function(data) {
                                    //Insertarooni
                                    if(video_player)
                                        video_player.remove();

                                    active_film = item.data('async-url');

                                    image_viewer.hide();
                                    video_player = $(data);
                                    image_viewer.after(video_player);
                                    //Initialise it with some tasty scripts
                                    if (player_config)
                                    {
                                        parse_film_config(player_config);
                                    }
                                    initialize_player();
                                    contentTransitionIn();
                                }
                            });
                        });
                    }
                });
            });
        }
        
    }
    
    // Set click navigation
    picker_sets.click(function(e) {
        e.preventDefault();
        var t = $(this),
            image_viewer = $('#image_viewer');
        if (switching_content || (t.hasClass('active') && !video_player)) {return false;}
        switching_content = true;


        activeSwitch(t);
        item_tracker.set_index = t.index();
        item_tracker.item_index = 0;

        contentTransitionOut(function(){
            if (video_player)
            {
                video_player.remove();
                image_viewer.show();
            }
            imageSwitch(item_tracker);
        });
    });
    
    // Keyboard arrow navigation
    $(document).keydown(function(e){
        // Right arrow
        if (e.keyCode == 39) {
            if (switching_content || total_items < 2) {return false;}
            switching_content = true;
            viewerNavigator(1);
        }
        // Left arrow
        if (e.keyCode == 37) {
            if (switching_content || total_items < 2) {return false;}
            switching_content = true;
            viewerNavigator(-1);
        }
    });
   
    if (picker_sets.length) {
        var target = $('.viewer:eq(0) .inner');
        target.prepend(viewer);
        viewer.append(enlarge_button);

        var viewer_modal = new Modal();

        enlarge_button.bind('click', function() {
            var button = $(this),
                src = button.attr('data-src');

            if (!src == "")
            {
                viewer_modal.open(src);
            }
        });

        contentTransitionOut(imageSwitch, item_tracker);
        activeSwitch(picker_sets.eq(0));
    }

    childFilms();
}

function hijaxAnchor() {
    var history_testing = false;
    if (!Modernizr.history || history_testing || smartphone) {return false;}
    var default_content = content_area.children('.default');
    var current_content = default_content;
    
    var back_button = $('<p class="back a">Back to artist information</p>');
    
    function updateHistory(new_url, new_content) {
        history.pushState(null, null, new_content ? new_url : init_url);
    }
    
    function updateContent(new_url, new_content) {        
        current_content == default_content ? current_content.hide() : current_content.remove();        
        current_content = new_content;
        new_content.addClass('inner');        
        if (new_content == default_content) {
            new_content.show();
        }
        else {
            content_area.append(new_content);
            new_content.prepend(back_button.clone(true, true));
        }        
        contentTransitionIn();
    }
    
    function doNewContent(anchor) {
        showLoader(content_area.parent(), "topleft");
        $.ajax({
            url: anchor,
            data: {},
            success: function(data){
                var content = $('#hijax', data);
                updateContent(anchor, content);                
                hideLoader(content_area.parent());      
            }
        });
    }
    
    function doDefaultContent() {
        updateContent("", default_content);
    }
    
    $('.hijax').click(function() {
        if (!switching_content) {
            switching_content = true;
            var t = $(this);
            var anchor = t.attr('href');
            
            contentTransitionOut(function() {
                doNewContent(anchor);
                updateHistory(anchor, true);
            });
        }        
        return false;
    });
    
    function backHandler(animate) {
        switching_content = true;
        if (animate) {
            contentTransitionOut(function() {
                doDefaultContent();
                updateHistory("", false);
            });
        }
        else {
            setTimeout(function() {
                doDefaultContent();
                updateHistory("", false);
            }, content_transition);
        }        
    }
    
    back_button.click(function() {
        if (!switching_content) {
            backHandler(true);                           
        }
    });
    
    // Change on artwork selection
    $('.accordion .image-set').click(function() {
        var window_state = window.location.href;
        if (window_state != init_url) {
            backHandler(false);
        }        
    });
    
    // Don't fire pop on first load
    $(window).load(function() {
        setTimeout(function() {
            $(window).bind('popstate', function() {
                var window_state = window.location.href;
                switching_content = true;
                contentTransitionOut(function() {
                    if (window_state == init_url) {
                        doDefaultContent();
                    }
                    else {
                        doNewContent(window_state);
                    }                    
                });
            });  
        }, 1);        
    });
}

function smartphoneImages() {
    var picker = $('#image_picker');
    var picker_sets = $('.image-set', picker);
    var total_sets = picker_sets.length;
    
    function loadStandardImage(image_item) {
        var img = $('img', image_item);
        var main_src = img.attr('data-main');
        img.attr('src', main_src);
    }
    
    if (picker_sets.length>1) {
        picker_sets.each(function(index) {
            var t = $(this);
            if (index>2) {
                t.remove();
            }
            else {
                var image_items = $('.image-item', t);
                var first_image = image_items.first();
                image_items.not(first_image).remove();
                loadStandardImage(first_image);
            }
        });
    }
    else {
        var first_set = picker_sets.first();
        var image_items = $('.image-item', first_set);
        image_items.each(function(index) {
            var t = $(this);
            if (index>2) {
                t.remove();
            }
            else {
                loadStandardImage(t);
            }
        });
    }
}

function artistList() {
    var preview_area = $('#artist-preview');
    var artist = $('.artist-list a');
    var transition = 200;
    var load_delay = 300; // Must be longer than transition
    var new_img;
    
    function showImage(item, src) {
        new_img = $('<img />');
        preview_area.append(new_img);
        new_img.attr('src',src).load(function() {        
            preview_area.animate({'opacity':'1'}, transition);
        });
        item.mouseout(function() {
            preview_area.stop().animate({'opacity':'0'}, transition, function() {
                preview_area.html("");
                new_img = null;
            });
        });
    }
    
    artist.mouseover(function() {
        var preview_src = $(this).attr('data-preview');
        var timer = setTimeout(function() {
            showImage($(this), preview_src);
        }, load_delay);   
        $(this).mouseout(function() {
            clearTimeout(timer);
            timer = null;
        });
    });
}

function filterOptions() {
    var filter_options = $('.filter-options');
    var weighted_options = $('.weighted', filter_options);
    var default_option = $('.default-option', filter_options);
    var request_delay = 1500;
    var prefiltered;
    var filter_timer;
    
    filter_options.addClass('filterified');
    $('li', filter_options).append('<div class="checkbox"></div>');
    
    $('.active', filter_options).length ? prefiltered = true : prefiltered = false;
    if (!prefiltered) {
        default_option.addClass('active');
    }
    
    function filterToggle(item) {
        clearTimeout(filter_timer);
        filter_timer = null;
        var li = item.parent();
        var query = item.attr('data-query');
        var deactivate;
        
        li.parent().hasClass('weighted') ? deactivate = filter_options : deactivate = weighted_options;
        $('li', deactivate).removeClass('active');
        li.toggleClass('active');
        filter_timer = setTimeout(filterRequest, 1500);
    }
    
    function filterRequest() {
    }
    
    $('li', filter_options).click(function() {
        filterToggle($('div.a', this));       
        return false;
    });
}

function expandableContent(expandable) {
    if (!expandable.children().length || ! expandable.hasClass('really-expandable')) {
        return false;
    }
    var transition = 200;
    expandable.width(expandable.width());
    $('.text', expandable).css({'display':'none','opacity':'0'});
    expandable.addClass('collapsed');
    var toggle = $('<h3 class="toggle a"/>');
    
    var template = $('.main').attr('id'),
        toggle_text = {},
        title = expandable.attr('data-title');
    
    if (title)
    {
        toggle_text.open = toggle_text.close = title;
    }
    else
    {
        if (template == 'artist')
        {
            toggle_text.open = 'Artist biography';
            toggle_text.close = 'Close biography';
        }
        else
        {
            toggle_text.open = 'More information';
            toggle_text.close = 'Less information';
        }
    }
    
    toggle.text(toggle_text.open);
    
    expandable.prepend(toggle);
    
    toggle.toggle(function() {
        var parent = $(this).parent();
        var content = $('.text', parent);
        content.css({'display':'block'});
        toggle.text(toggle_text.close);
        content.stop().animate({'opacity':'1'}, transition, function() {
            parent.removeClass('collapsed').addClass('expanded');
        });
    }, function() {
        var parent = $(this).parent();
        var content = $('.text', parent);
        toggle.text(toggle_text.open);
        content.stop().animate({'opacity':'0'}, transition, function() {
            content.css({'display':'none'});
            parent.removeClass('expanded').addClass('collapsed');
        });
    });
}

function initMobileNavigation(list, default_label) {
    if (list.data('select_initialised')) {
        return false;
    }
    list.data('select_initialised', true);
    var parent = list.parent();
    var active_exists;
    $('.active', list).length ? active_exists = true : active_exists = false;
    var list_items = $('li', list);
    var select_list = $('<select/>');  
    list_items.each(function() {
        var t = $(this);
        var anchor = $('a', t);
        var text = anchor.text();
        var href = anchor.attr('href');
        var select_option = $('<option />');
        select_option.text(text);
        select_option.attr('value', href);
        t.hasClass('active') ? select_list.prepend(select_option) : select_list.append(select_option);   
    });
    !active_exists ? select_list.prepend($('<option value="">'+default_label+'</option>')) : '';
    select_list.append($('<option value="'+base_url+"search/"+'">Search</option>'));
    select_list.attr('data-role','none');
    select_list.addClass('mobile-menu right');
    list.data('select_list', select_list);
    select_list.change(function(){
        var href = $(this).val();
        if (href != "") {
            window.location = $(this).val();
        }        
    });
    select_list.insertAfter(list);
}

function scrollToTop() {
    var threshold = 300;
    var top_button = $('<div class="top-button ff">Top</p>');
    var visible = false;
    
    top_button.css({'display':'none', 'opacity':'0'});
    $('.wrapper').append(top_button);
    
    top_button.click(function() {
        top_button.animate({'opacity':'0'}, 200, function() {
            top_button.hide();
        });
        body.animate({scrollTop: 0}, 300);
    });
    
    $(window).scroll(function() {
        var scroll_offset = body.scrollTop();
        if (scroll_offset >= threshold && !visible) {
            visible = true;
            top_button.css({'display':'block'});
            top_button.stop().animate({'opacity':'1'}, 200);
        }
        else if (scroll_offset < threshold && visible) {
            visible = false;
            top_button.stop().animate({'opacity':'0'}, 200, function() {
                top_button.css({'display':'none'});
            });
        }
    });
}

function parse_film_config(player_config)
{
    var params = {
        quality: 'high',
        bgcolor: '#ffffff',
        play: 'true',
        loop: 'true',
        wmode: 'window',
        scale: 'noscale',
        menu: 'false',
        devicefont: 'true',
        salign: '',
        allowscriptaccess: 'sameDomain',
        allowFullScreen: 'true'
    },
    attributes = {
        id: 'video_player',
        name: 'video_player',
        align: 'middle'
    };
    swfobject.embedSWF(
        base_url+'swf/VideoPlayer_v2.swf', 'html5_player',
        '100%', '100%',
        '10.1.0', '',
        player_config,
        params,
        attributes
    );
}

function initialize_player()
{
    if (navigator.userAgent.indexOf('iPad') != -1) {    
        var video_player_wrapper = $('#video_player_wrapper');
        var video_player = $('#html5_player');
        var video_placeholder = $('#video_placeholder');
        
        // set the correct height for the player depending on orientation
        // to avoid black lines at the sides.
        function size_player() {
            var video_player = $('#html5_player');
            if(window.orientation == -90 || window.orientation == 90) {
                video_player.css({height:'368px'});
            } else {
                video_player.css({height:'276px'});
            }
        }
        
        video_placeholder.show();
        size_player();
        video_player.hide();
        
        window.ondeviceorientation = size_player;
        
        video_placeholder.click(function() {
            video_placeholder.hide();
            video_player.show();
            video_player[0].play();
        });    
    }
}

function film_init()
{
    $(window).load(function()
    {
        if (player_config)
        {
            parse_film_config(player_config);
        }
        
        if ($(window).height() > $('.wrapper').height()) $('html').height('100%');
        
        $(window).resize(function()
        {
            if ($(window).height() >= $('.wrapper').height()) $('html').height('100%');
            else $('html').height('auto');
        });
    });
   
    initialize_player(); 
}

function dim_lights_toggle(active)
{
    var overlay = $('.overlay');
    if (overlay.length == 0)
    {
        overlay = $('<div class="overlay" class="ff" />').hide();
        overlay.height($(document).height());
        $('body').append(overlay);
        $('.wrapper').append(cloneObject(overlay));
        overlay = $('.overlay');
    }
    if (active)
    {
        overlay.fadeOut(500, function(){
            dim_lights_callback( ! active);
            $('.wrapper').css('z-index', 0);
            $('.video_player_wrapper').parents('.ff').css('-webkit-transform', 'translate3d(0px, 0px, 0px)');
            overlay.unbind();
        });
    }
    else
    {
        $('.wrapper').css('z-index', 10);
        $('.video_player_wrapper').parents('.ff').css('-webkit-transform', 'none');
        overlay.css({
            opacity: 0
        }).show().animate({
            opacity: 0.75
        }, 500, function(){
            dim_lights_callback( ! active);
            overlay.unbind().click(function(){
                dim_lights_toggle(!active)
            });
        });
    }
}

function dim_lights_callback(active)
{
    $('#video_player')[0].dim_lights_callback(active);
}

function newsletterForm(form) 
{
    var name = $('#name', form);
    var email = $('#email', form);
    var email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    var form_is_active = true;
    var feedback_wrapper = $('<div class="feedback"></div>');
    var action;
    var error_exists;
    
    form.append(feedback_wrapper);
    
    form.submit(function() {return false;});
    
    function showServerFeedback(messages, success) {
        $.each(messages, function(index) {
            var message = messages[index];
            var feedback_item = $('<p></p>');
            success ? feedback_item.addClass('success') : feedback_item.addClass('error');
            feedback_item.html(message);
            feedback_wrapper.append(feedback_item);
        });
    }
    
    function ajaxSubmit() {
        if (error_exists)
            return;
        
        form_is_active = false;
        var data = form.serialize();
        var destination = base_url+'contact/'+action+'/';
        
        $.post(destination, data, function(response){
            var messages;
            var success = response.error ? false : true;
            // Ajax submit here
            // On callback
            form_is_active = true;
            if (success)
            {
                messages = [action == 'subscribe' ? 'Subscribed' : 'Unsubscribed']; // Message array from server
            }
            else
            {
                messages = [];
                $.each(response, function(i, v){
                    if (i != 'error')
                    {
                        messages.push(v);
                    }
                });
            }
            showServerFeedback(messages, success);
        }, 'json');
    }
    
    function validate(field) {
        var error_message = false;
        var error_el = $('<p class="error"></p>');
        var field_name = field.attr('id');
        var value = field.val();
        
        switch (field) {
            case name:
                if (value=="") {
                    error_message = "Please provide a name";
                }
                break;
            case email:
                if (!email_regex.test(value)) {
                    if (value=="") {
                        error_message = "Please provide an email address";
                    }
                    else {
                        error_message = "Please provide a valid email address";
                    }                    
                }        
                break;
        }
        
        var existing_error_el = $('.error[data-for="'+field_name+'"]');
        if (existing_error_el.length) {
            existing_error_el.remove();
        }
        if (error_message) {
            error_exists = true;
            field.addClass('error');
            error_el.html(error_message);
            error_el.attr('data-for',field_name);
            feedback_wrapper.append(error_el);
            return false;
        }
        return true;
    }

    function buttonHandler(action) {
        var required_fields;
        switch(action) {
            case "subscribe":
                required_fields = [name, email];
                break;
            case "unsubscribe":
                required_fields = [email];
                break;
        }
        var valid = true;
        $.each(required_fields, function(index) {
            var test = validate(this);
            if ( ! test)
            {
                valid = false;
            }
        });
        
        if (valid)
        {
            ajaxSubmit(action);
        }
    }
    
    function formReset() {
        error_exists = false;
        if ($('p', feedback_wrapper).length) {
            $('p', feedback_wrapper).remove();
        }
    }
    
    $('.button', form).click(function() {
        if (!form_is_active) {return false;}
        formReset();
        if ($(this).hasClass('subscribe')) {
            action = "subscribe";
        }
        else if ($(this).hasClass('unsubscribe')) {
            action = "unsubscribe";
        }
        buttonHandler(action);
    });
}

function bookingForm(form) 
{
    var name = $('#name', form),
        email = $('#email', form),
        quantity = $('#quantity', form),
        tc_agree = $('#tc_agree', form),
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        form_is_active = true,
        feedback_wrapper = $('<div class="feedback"></div>'),
        error_exists;
    
    form.append(feedback_wrapper);
    
    form.submit(function() {return false;});
    
    function showServerFeedback(messages, success, clear) {
        if (clear) feedback_wrapper.empty();
        $.each(messages, function(index) {
            var message = messages[index];
            var feedback_item = $('<p></p>');
            success ? feedback_item.addClass('success') : feedback_item.addClass('error');
            feedback_item.html(message);
            feedback_wrapper.append(feedback_item);
        });
    }
    
    function ajaxSubmit() {
        if (error_exists)
            return;
        
        form_is_active = false;
        var data = form.serialize(),
            loading_increment = 0,
            timeout_id,
            show_loading = function()
            {
                var message = 'Booking';
                for (var i = 0; i < loading_increment; i++)
                {
                    message+= '.';
                }
                loading_increment = (loading_increment+1) % 5;
                showServerFeedback([message], true, true);
            },
            set_loading_timeout = $.noop;
            
        set_loading_timeout = function()
        {
            timeout_id = setTimeout(function(){
                show_loading();
                set_loading_timeout();
            }, 400);
        };
            
        set_loading_timeout();
        
        $.post(form.attr('action'), data, function(response){
            clearTimeout(timeout_id);
            showServerFeedback([], true, true);
            var messages;
            var success = response.error ? false : true;
            // Ajax submit here
            // On callback
            form_is_active = true;
            if (success)
            {
                messages = ['Booking successful. Please check your email for a reservation confirmation.']; // Message array from server
            }
            else
            {
                messages = [];
                $.each(response, function(i, v){
                    if (i != 'error')
                    {
                        messages.push(v);
                    }
                });
            }
            showServerFeedback(messages, success);
        }, 'json');
    }
    
    function validate(field) {
        var error_message = false;
        var error_el = $('<p class="error"></p>');
        var field_name = field.attr('id');
        var value = field.val();
        
        switch (field) {
            case name:
                if (value=="") {
                    error_message = "Please provide a name";
                }
                break;
            case email:
                if (!email_regex.test(value)) {
                    if (value=="") {
                        error_message = "Please provide an email address";
                    }
                    else {
                        error_message = "Please provide a valid email address";
                    }                    
                }        
                break;
            case quantity:
                if ( ! value) {
                    error_message = "Please enter a valid quantity";
                }
                break;
            case tc_agree:
                if (value != 1) {
                    error_message = "Please agree to the Terms and Conditions";
                }
                break;
        }
        
        var existing_error_el = $('.error[data-for="'+field_name+'"]');
        if (existing_error_el.length) {
            existing_error_el.remove();
        }
        if (error_message) {
            error_exists = true;
            field.addClass('error');
            error_el.html(error_message);
            error_el.attr('data-for',field_name);
            feedback_wrapper.append(error_el);
            form.parents('.panel-inner').tinyscrollbar_update();
            return false;
        }
        return true;
    }

    function buttonHandler() {
        var required_fields = [name, email, quantity, tc_agree],
            valid = true;
        $.each(required_fields, function(index, field) {
            var test = validate(field);
            if ( ! test)
            {
                valid = false;
            }
        });
        
        if (valid)
        {
            ajaxSubmit();
        }
    }
    
    function formReset() {
        error_exists = false;
        if ($('p', feedback_wrapper).length) {
            $('p', feedback_wrapper).remove();
        }
    }
    
    $('.button', form).click(function() {
        if (!form_is_active) {return false;}
        formReset();
        buttonHandler();
    });
}

/*
 * Initialize the Contact page, unmask the mailtos 
 */
function contact_init()
{
    $('li', '.email-secret').each(function() {
        var t = $(this),
            anchor = $('<a />'),
            span = t.children('span'),
            address = '';

        address = 'mailto:' + span.data('href').replace(/\(at\)/g, '@').replace(/\(dot\)/g, '.');
        anchor.attr('href', address).html(span.html());
        t.html(anchor);
    });
}

function smartphoneNewsArrange() {
    var current = $('.current:eq(0)');
    var news_archive = $('.news-archive:eq(0)');
    news_archive.prepend(current);
}

function smartphoneAddToCalendarArrange() {
    setTimeout(function(){
        var $add_to_cal_panel = $('.addthisevent-drop').parents('.panel'),
        $accordion = $($add_to_cal_panel.parents('.accordion'));

        if (!$accordion.length || !$add_to_cal_panel.length)
            return;

        $('.content h3').remove();
        $add_to_cal_panel.insertBefore($('.panel:first', $accordion));
    }, 200);
}

function smartphoneCurrentExhibitions() {
    $('.current-exhibition-item').each(function() {
        var t = $(this);
        var wrapper = $('.block', t);
        var image = $('<div class="fade"/>');
        var img = $('<img/>');
        var img_src = t.attr('data-exhibition-image');
        
        img.attr('src',img_src);
        image.append(img);
        wrapper.prepend(image);        
    });
}

function smartphoneSearch() {
    var search_element = $('.search:eq(0)');
    var new_search = search_element.clone();
    $('.main').prepend(new_search);
}

var tooltip = function(element)
{
    var t = this;

    t.element = element;
    t.message = t.element.data('tooltip');

    if (t.message != undefined)
    {
        t.init();
    }
}
tooltip.prototype = {

    tooltip_el: null,
    timer: null,
    body_el: $('body:eq(0)'),

    init: function()
    {
        var t = this,
            mouse = {x: 0, y: 0};

        t.tooltip_el = t.generate(t.message);

        t.body_el.append(t.tooltip_el).bind('mousemove', function(e) {
            mouse = {
                x: e.pageX,
                y: e.pageY
            }
        });

        t.timer = setTimeout(function()
        {
            var x = mouse.x - (t.tooltip_el.outerWidth() + 2),
                y = mouse.y - (t.tooltip_el.outerHeight() + 2);

            t.tooltip_el.css({'left': x+"px", 'top': y+"px"});
            t.tooltip_el.addClass('show');
            t.body_el.unbind('mousemove');

        }, 400);

        t.element.bind('mouseout', function() {
            t.kill();
        });
    },
    generate: function(message)
    {
        var el = $('<div class="tooltip" />');

        el.html(unescape(message));

        return el;
    },
    kill: function()
    {
        var t = this;

        clearTimeout(t.timer);
        t.tooltip_el.remove();
        t.element.unbind('mouseout');
        t.body_el.unbind('mousemove');
    }
}

var Modal = function(src)
{
    var t = this;

    t.setup();
}
Modal.prototype = {
    $shell: $('<div class="modal"><div class="inner"></div></div>'),
    $target: null,
    is_open: false,
    bg_size_supported: true,

    setup: function()
    {
        var t = this;

        $('body').append(t.$shell);
        t.$target = t.$shell.find('.inner:eq(0)');
        t.bg_size_supported = $('html').hasClass('backgroundsize');

        return t;
    },
    loadImg: function(src)
    {
        var t = this,
            $img = $('<img />');

        showLoader(t.$shell, "middle");
        $img.bind('load', function() {
            hideLoader(t.$shell);
            if (t.is_open)
            {
                if (t.bg_size_supported)
                {
                    t.$target.css({'background-image': 'url('+src+')'});
                }
                else
                {
                    t.$target.append($img);
                }

                t.$target.addClass('ready');
            }
        });

        $img.attr('src', src);

        return t;
    },
    open: function(src)
    {
        var t = this;

        if (t.is_open) { t.close(); }

        t.loadImg(src);

        t.$shell.addClass('open');
        t.is_open = true;

        t.$shell.bind('click', function() {
            t.close();
            t.$shell.unbind('click');
        });
        
        t.$shell.bind('contextmenu', function(event) {
            return false;
        });

        return t;
    },
    close: function()
    {
        var t = this;

        t.$shell.removeClass('open');
        t.$target.empty().css({'background-image':'none'}).removeClass('ready');
        t.is_open = false;

        return t;
    }
}

function handleHash()
{
    var hash = location.hash.replace('#!', ''),
        hash_parts = hash.split('/');
    if (hash_parts.length > 1 && hash_parts[1])
    {
        switch (hash_parts[1])
        {
            case 'artwork':
                if (hash_parts.length > 2 && hash_parts[2])
                {
                    $('#'+hash_parts[2]).click();
                }
                break;
        }
    }
}

function competition_init()
{
    $(function(){
        var repeatable_form_elements = [
            {
                'label':'previous_work_',
                'max':5,
                'default_value':''
            },
            {
                'label':'recent_work_',
                'max':5,
                'default_value':''
            },
            {
                'label':'past_exhibition_',
                'max':5,
                'default_value':''
            },
            {
                'label':'video_',
                'max':5,
                'default_value':'http://'
            }
        ];

        for (var i in repeatable_form_elements)
        {
            var label = repeatable_form_elements[i].label,
                max = repeatable_form_elements[i].max,
                default_value = repeatable_form_elements[i].default_value,
                count = 1,
                label_elem = false,
                parent_elem = false,
                input_elem = false,
                plus_pos = false,
                plus_count = 0;

            for (count = 2; count <= max; count ++)
            {
                label_elem = false;

                label_elem = $('label[for="'+(label+count)+'"]');
                if (!label_elem) continue;

                parent_elem = label_elem.parents('.tc_form_item');
                input_elem = $('input', parent_elem);
                if (!input_elem.val() || input_elem.val() == default_value)
                {
                    parent_elem.hide();
                }
                else
                {
                    plus_pos = parent_elem;
                    plus_count = count;
                }

                if ($('.tc_error_message', parent_elem).length)
                {
                    plus_pos = parent_elem;
                    plus_count = count;
                    for (var x = count; x > 0; x--)
                    {
                        $('label[for="'+(label+x)+'"]').parents('.tc_form_item').show();
                    }
                }
            }

            if (!plus_pos) plus_pos = $('label[for="'+(label+1)+'"]').eq(0).parents('.tc_form_item');

            if (plus_count < max)
            {
                $('.tc_field', plus_pos).prepend('<div class="competition_clone">');

                var clone_elem = $('.competition_clone', plus_pos);

                clone_elem.click(function(){
                    var id = $('input', $(this).parent()).eq(0).attr('id'),
                        id_parts = $(id.split('_')),
                        label = id_parts[0]+'_'+(id_parts[2] ? id_parts[1]+'_' : '');
                        num = $(id_parts).last()[0];

                    num++;

                    var next_elem = $('label[for="'+(label+num)+'"]').eq(0).parents('.tc_form_item');
                    if (!next_elem) return false;
                    next_elem.show();
                    if (num < 5)
                    {
                        $('.tc_field', next_elem).prepend(this);
                    }
                    else $(this).hide();
                });
            }
        }
    });
}

$(document).ready(function() {
    
    var main = $('.main');
    content_area = $('.viewer:eq(0)');
    body = $('body');
    footer = $('.page-footer');
    
    var fade_me = $('#fade-me');
    fade_me.addClass('hide-me');
    showLoader('body', "middle");
    
    // Initialise accordions, disable this for smartphones
    if ($('.accordion').length && !smartphone) {
        $('.accordion').each(function() {
            if ($(this).hasClass('ch-accordion')) {
                if (ieversion>8) {
                    channelAccordion($(this));
                }
            }
            else {
                accordion($(this), 253, 18);
            }           
        });
    }
    
    // Initialise tab sets
    if ($('.tab-set').length && !smartphone) {
        $('.tab-set').each(function() {
            tabSet($(this));
        });
    }
    
    // Initialise expandable content
    if ($('.expandable').length && !smartphone) {
        $('.expandable').each(function(i, v){
            expandableContent($(v));
        })
    }
    
    clicked = false;
    
    $(window).load(function() {
        hideLoader('body');
        setTimeout(function() {
            fade_me.css({'visibility':'visible'});
            fade_me.animate({'opacity':'1'}, 500, function() {
                fade_me.removeClass('hide-me');
            });
        }, 200);
        
        if (main.attr('id') == 'home' || main.attr('id') == 'exhibitions')
        {
            $('a').mousedown(function(){
                clicked = true;
            });
        }
        
        handleHash();
    });
    
    // Page switch
    var template = main.attr('id'); 
    switch(template) {
        case "artists":
            if (!smartphone && ieversion>8) {
                artistList();
            }           
            break;
        case "shop":
            if (!smartphone) {
                filterOptions();
            }
            break;
        case "artist":
            if (!smartphone) {
                viewerInit();
                hijaxAnchor();
            }
            else {
                smartphoneImages();
            }
            break;
        case "exhibition":
            if (!smartphone) {
                viewerInit();
                hijaxAnchor();
            }
            else {
                smartphoneImages();
                smartphoneAddToCalendarArrange();
            }
            break;
        case "exhibitions":
            if (smartphone) {
                smartphoneCurrentExhibitions();
            }
            break;
        case "event":
            var booking_form = $('#rsvp');
            if (booking_form.length) {
                bookingForm(booking_form);
            }
            var newsletter_form = $('#newsletter');
            if (newsletter_form.length) {
                newsletterForm(newsletter_form);
            }

            if (smartphone)
                smartphoneAddToCalendarArrange();

            break;
        case "archive":
            var newsletter_form = $('#newsletter');
            if (newsletter_form.length) {
                newsletterForm(newsletter_form);
            }
            if (smartphone) {
                smartphoneNewsArrange();
            }
            break;
        case "product":
            if (!smartphone) {
                
                viewerInit();
            }
            else {
                smartphoneImages();
            }
            basketInit($('.add-to-basket'));
            break;
        case "film":
            film_init();
            break;
        case "contact":
            contact_init();
            break;
        case "search":
            if (smartphone) {
                smartphoneSearch();
            }
            break;
        case "competition":
            competition_init();
            break;
    }

    $('.image-set').mouseover(function() {
        new tooltip($(this));
    });
    
    // Form inputs
    $('.form-element').each(function() {
        var t = $(this);
        var label = $('label', t);
        var input = $('input', t);
        
        if (input.val()) label.hide();
        
        input.focus(function() {
            if (ieversion<9) {
                label.hide();
            }
            t.addClass('focus');
        }).blur(function() {
            if (ieversion<9) {
                label.show();
            }
            t.removeClass('focus');
            if (input.val()!="") {
                label.css({'opacity':'0'});
            }
            else {
                label.css({'opacity':''});
            }
        });
    });
    
    if (smartphone) {
        $('.smartphone-hide').remove();
    }
    
    initMobileNavigation($('#site_navigation'), "Sections");
    
    $(window).bind('resize', function() {
        clearTimeout(resize_timer);
        resize_timer = setTimeout(function() {
            if (mouse_scroll) {
                $('.tiny-scrollbar').each(function() {
                    var t = $(this);
                    var is_visible = t.is(':visible');                
                    if (!is_visible) {
                        t.css({'display':'block'});
                        t.tinyscrollbar_update();
                        t.css({'display':'none'});
                    }
                    else {
                        t.tinyscrollbar_update();
                    }
                });
            }
            //maxWidth($('img'));
        }, 200);
    });
    
    /*if (Modernizr.positionfixed) {
        //scrollToTop();
    }*/

});
