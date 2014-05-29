/* global document, window, jQuery */
(function (document, window, $) {
    'use strict';
    var $gallery,
        getImagesRequest,
        baseUrl,
        urlType,
        featherEditor,
        slideshow = false;

    function showAlert() {
        var alertContainer = $('#alerts'),
            div = $('<div id="photoboothSaveAlert"></div>').addClass('alert alert-danger fade in');
        div.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>');
        div.append('<h4>Das Bild konnten leider nicht verarbeitet werden</h4>');
        div.append('<p>Bitte versuche es noch einmal.</p>');
        div.append('<p><button type="button" class="btn btn-default closeAlert" >Ok</button>');
        alertContainer.append(div);
        $(div).on('click', '.closeAlert', function (e) {
            e.preventDefault();
            div.alert('close');
        });
    }

    function createNewLink(url) {
        var $link = $('<a data-gallery></a>'),
            $img = $('<img class="thumb"></img>');
        $link.attr('href', url);
        if(slideshow) {
            //$link.text('test');
            return $link;
        }
        $img.attr('src', baseUrl + '/lib/getThumbnail.php?image=' + encodeURIComponent(url));
        $link.append($img);
        return $link;
    }

    function updateLinks() {
        if(getImagesRequest && (getImagesRequest.state() === 'pending')) {
            return;
        }
        getImagesRequest = $.ajax({
            type: 'GET',
            url: baseUrl + '/lib/listImages.php',
            data: {
                type: urlType
            },
            dataType: 'json'
        });
        return getImagesRequest.then(function (data) {
            var i,
                $linksContainer = $('#links'),
                $currentLinks = $linksContainer.find('a'),
                currentLinksArray = [];
            if(data.error || !Array.isArray(data.imageurls)) {
                return false;
            }
            $currentLinks.each(function () {
                var $this = $(this),
                    url = $this.attr('href');

                if(data.imageurls.indexOf(url) === -1){
                    $this.remove();
                } else {
                    currentLinksArray.push(url);
                }
            });

            for (i = data.imageurls.length - 1; i >= 0; i--) {
                if(currentLinksArray.indexOf(data.imageurls[i]) === -1) {
                    // add new node;
                    $linksContainer.prepend(createNewLink(data.imageurls[i]));
                }
            }
            return $linksContainer;
        });
 
    }

    function getGallery() {
        return  $gallery.data('gallery');
    }
	function postToServer (action, currentUrl, newUrl) {
		var data = {
            action: action,
            newImageUrl: newUrl,
            imageUrl: currentUrl
        };
		return $.ajax({
			type: 'POST',
			url: baseUrl + '/lib/saveImage.php',
			data: data,
			dataType: 'json'
		});
	}
    function ensureFeatherEditor () {
        // check if Aviary is already available or featherEditor is already initialized
        if(!window.Aviary) {
            $('a.edit').hide();
            return;
        }
        featherEditor = featherEditor || new window.Aviary.Feather({
            apiKey: '8b3b6b313be62991',
            apiVersion: 3,
            language: 'de',
            enableCORS: true,
            tools: ['text','frames', 'effects', 'stickers', 'colorsplash'],
            appendTo: 'injection_site',
            onReady: function() {
                getGallery().close();
            },
            onSave: function(imageID, newURL) {
                var currentUrl = $('a[data-aviary-id-slide=' + imageID + ']').attr('href');
                $('#myModal').modal('show');
            	postToServer('save', currentUrl, newURL).then(function () {
                    $('#myModal').modal('hide');
            		document.location = baseUrl + '/gallery';
            	}, function () {
                    $('#myModal').modal('hide');
                    showAlert();
                });
                featherEditor.close();

            }
        });
        $('a.edit').show();
    }

    function getCurrentImageId () {
        return 'id-slide-' + getGallery().getIndex();
    }
    function getCurrentImageUrl() {
        return $(getGallery().list[getGallery().getIndex()]).attr('href');
    }

    function startSlideShow() {
        $('#links').find('a').first().click();
    }
    function registerEventHandler () {
        $(document).on('click', '.edit', function(e) {
            e.preventDefault();
            var imageID = getCurrentImageId();
            if(!featherEditor) {
                return;
            }
            $(getGallery().list[getGallery().getIndex()]).attr('data-aviary-id-slide', imageID);
            featherEditor.launch({
                image: imageID
            });
        });
        $(document).on('click', '.save', function(e) {
            e.preventDefault();
            var imageUrl = getCurrentImageUrl();
            getGallery().close(),
            $('#myModal').modal('show');
            postToServer('save', imageUrl, document.location.origin + imageUrl).then(function () {
                $('#myModal').modal('hide');
                document.location = baseUrl + '/gallery';
            }, function () {
                $('#myModal').modal('hide');
                showAlert();
            });
        });
        $(document).on('click', '.delete', function(e) {
            e.preventDefault();
            var imageUrl = getCurrentImageUrl();
            postToServer('delete', imageUrl).then(function () {
                updateLinks();
                getGallery().close();
            });
        });
        $(document).on('click', '.restore', function(e) {
            e.preventDefault();
            var imageUrl = getCurrentImageUrl();
            postToServer('restore', imageUrl).then(function () {
                document.location = baseUrl + '/new';
            });
        });
        $(document).on('click', '.startSlideShow', function(e) {
           e.preventDefault();
           startSlideShow();
        });
        $(document).on('slidecomplete', function (e, index, slide) {
            $(slide).find('img').attr('id', 'id-slide-' + index);
        });
        $(document).on('slideend', function () {
            if(!slideshow) {
                ensureFeatherEditor();
            }
        });

        if(!slideshow) {
            // click on the image to show controls immeadiatly
            $(document).on('opened', function () {
                var gallery = getGallery(),
                    controlsClass = gallery.options.controlsClass;

                if (!gallery.container.hasClass(controlsClass)) {
                    gallery.container.addClass(controlsClass);
                } 
            });
        }
        if(slideshow){
            $(document).on('slideend', function (e, index) {
                var gallery = getGallery();
                if (gallery && gallery.slides && gallery.slides.length === index + 1) {
                    // last slide detected pause the gallery
                    gallery.pause();
                    // show the current slide as long as the others
                    window.setTimeout(function () {
                        // register event handler for closed event and start the slideshow again when the closing animation is done
                        $(document).one('closed', function () {
                            // start the slideshow earliest at the next tick to make sure that the gallery is closed properly
                            window.setTimeout(function () {
                                startSlideShow();
                            }, 0);
                        });
                        // close the gallery
                        gallery.close();
                    }, gallery.options.slideshowInterval);
                }
            });
        }
    }
    var photobooth = {
        // the init method should be called on document ready!
        init: function () {
            var linksLoadedPromise,
                updateInterval = 1500,
                galleryConfig  = {
                useBootstrapModal: false
            };
            urlType = $('body').data('urlType');
            baseUrl = $('body').data('baseUrl');
            if(urlType === 'show') {
                slideshow = true;
            }
            if(slideshow) {
                galleryConfig.startSlideshow = true;
                galleryConfig.transitionSpeed = 2000;
                galleryConfig.closeOnSlideClick = false;
                updateInterval = 10000;
            }
            
            linksLoadedPromise = updateLinks();
            window.setInterval(updateLinks, updateInterval);

            registerEventHandler(slideshow);

            $gallery = $('#blueimp-gallery');
            $gallery.data(galleryConfig);
            if(slideshow) {
                linksLoadedPromise.then(function () {
                    startSlideShow();
                });
            }
        },
        showAlert: showAlert
    };
    window.photobooth = photobooth;
}(document, window, jQuery));
