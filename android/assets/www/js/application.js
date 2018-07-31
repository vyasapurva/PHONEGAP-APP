var Application = {
   initApplication: function () {
      $(document)
         .on('pageinit', '#add-feed-page', function () {
            Application.initAddFeedPage();
         })
         .on('pageinit', '#list-feeds-page', function () {
            Application.initListFeedPage();
         })
         .on('pageinit', '#show-feed-page', function () {
            var url = this.getAttribute('data-url').replace(/(.*?)url=/g, '');
            Application.initShowFeedPage(url);
         })
         .on('pageinit', '#aurelio-page', function () {
            Application.initAurelioPage();
         })
         .on('backbutton', function () {
            $.mobile.changePage('index.html');
         });
      Application.openLinksInApp();
   },
   initAddFeedPage: function () {
      console.time("timetaken");
      var t0 = performance.now();

      $('#add-feed-form').submit(function (event) {
         event.preventDefault();
         var feedName = $('#feed-name').val().trim();
         var feedUrl = $('#feed-url').val().trim();
         if (feedName === '') {
            navigator.notification.alert('Name field is required and cannot be empty', function () {
            }, 'Error');
            console.error('Name field is required and cannot be empty');
            return false;
         }
         if (feedUrl === '') {
            navigator.notification.alert('URL field is required and cannot be empty', function () {
            }, 'Error');
             console.error('url field is required and cannot be empty');
            return false;
         }
           
       var r1 = /^https?\:\/\//;
          if (r1.test(feedUrl)) {
            navigator.notification.alert(' valid protocol', function () {
            }, 'Error'); 
             console.info('valid protocol');  
             
         }
         else  {
             navigator.notification.alert('you have to enter valid protocol address ', function () {
            }, 'Error');
             console.error('Invalid, you have to enter valid protocol address');
           
            return false; 
           
           
          }  
            
       /*   var r2 = /^https?\:\/\/(www\d?\d?\d?\d?\.)?([A-Za-z0-9-_]+\.)?[A-Za-z0-9-_]+/;
          
          if (r2.test(feedUrl)) {
            navigator.notification.alert(' valid domain', function () {
            }, 'Error'); 
             console.log('valid domain');  
             
         }
         else  {
             navigator.notification.alert('you have to enter valid domain address ', function () {
            }, 'Error');
             console.log('Invalid, you have to enter valid domain');
           
            return false; 
           
           
          }  */
       
  var re = /(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,63}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?/;

          if (re.test(feedUrl)) {
            navigator.notification.alert('valid feed address', function () {
            }, 'Error'); 
             console.info('valid feed address');  
             
         }
         else  {
             navigator.notification.alert('you have to enter valid domain address ', function () {
            }, 'Error');
             console.error('Invalid url, you have to enter valid address');
           
            return false;  
          }  
       
   if (Feed.searchByName(feedName) === false && Feed.searchByUrl(feedUrl) === false) {
            var feed = new Feed(feedName, feedUrl);
            feed.add();
            navigator.notification.alert('Feed saved correctly', function () {
               $.mobile.changePage('index.html');
            }, 'Success');
            console.info('feed saved');
            console.timeEnd("timetaken");
             var t1 = performance.now();
             var n = (t1 - t0).toString();
            navigator.notification.alert("excution time:"+n+'ms');

            console.log('Excution-time:'+n+'milisecond');
         } else {
            navigator.notification.alert('Feed not saved! Either the Name or the Url specified is already in use', function () {
            }, 'Error');
            console.error('feed not saved!Either the Name or the Url specified is already in use');
         }
         return false;
      });
   },
   initListFeedPage: function () {
      var $feedsList = $('#feeds-list');
      var items = Feed.getFeeds();
      var htmlItems = '';

      $feedsList.empty();
      items = items.sort(Feed.compare);
      for (var i = 0; i < items.length; i++) {
         htmlItems += '<li><a href="show-feed.html?url=' + items[i].url + '">' + items[i].name + '</a></li>';
      }
      $feedsList.append(htmlItems).listview('refresh');
   },
   initShowFeedPage: function (url) {
      var step = 10;
      var loadFeed = function () {
         var currentEntries = $('#feed-entries').find('div[data-role=collapsible]').length;
         var entriesToShow = currentEntries + step;
         $.ajax({
            url: 'http://api.rss2json.com/v1/api.json?num=' + entriesToShow + '&rss_url=' + encodeURI(url),
            dataType: 'json',
            beforeSend: function () {
               $.mobile.loading('show', {
                  text: 'Please wait while retrieving data...',
                  textVisible: true
               });
            },
            success: function (data) {
               var $list = $('#feed-entries');
               if (data.status != 'ok') {
                  navigator.notification.alert('Unable to retrieve the Feed. Invalid URL', function () {
                  }, 'Error');
                  return;
               }
               var items = data.items;
               var $post;
               if (currentEntries === items.length) {
                  navigator.notification.alert('No more entries to load', function () {
                  }, 'Info');
                  return;
               }
               for (var i = currentEntries; i < items.length; i++) {
                  $post = $('<div data-role="collapsible" data-expanded-icon="arrow-d" data-collapsed-icon="arrow-r" data-iconpos="right">');
                  $post
                     .append($('<h2>').text(items[i].title))
                     .append($('<h3>').html('<a href="' + items[i].link + '" target="_blank">' + items[i].title + '</a>')) // Add title
                     .append($('<p>').html(items[i].contentSnippet)) // Add description
                     .append($('<p>').text('Author: ' + items[i].author))
                     .append(
                        $('<a href="' + items[i].link + '" target="_blank" data-role="button">')
                           .text('Go to the Article')
                           .button()
                           .click(function (event) {
                              if (Application.checkRequirements() === false) {
                                 event.preventDefault();
                                 navigator.notification.alert('The connection is off, please turn it on', function () {
                                 }, 'Error');
                                 return false;
                              }
                              $(this).removeClass('ui-btn-active');
                           })
                     );
                  $list.append($post);
               }
               $list.collapsibleset('refresh');
            },
            error: function () {
               navigator.notification.alert('Unable to retrieve the Feed. Try later', function () {
               }, 'Error');
            },
            complete: function () {
               $.mobile.loading('hide');
            }
         });
      };
      $('#show-more-entries').click(function () {
         loadFeed();
         $(this).removeClass('ui-btn-active');
      });
      $('#delete-feed').click(function () {
         Feed.searchByUrl(url).delete();
         navigator.notification.alert('Feed deleted', function () {
            $.mobile.changePage('list-feeds.html');
         }, 'Success');
      });
      if (Application.checkRequirements() === true) {
         loadFeed();
      } else {
         navigator.notification.alert('To use this app you must enable your internet connection', function () {
         }, 'Warning');
      }
   },
   initAurelioPage: function () {
      $('a[target=_blank]').click(function () {
         $(this).closest('li').removeClass('ui-btn-active');
      });
   },
   checkRequirements: function () {
      if (navigator.connection.type === Connection.NONE) {
         return false;
         alert("notconnect");
      }

      return true;
   },
   updateIcons: function () {
      var $buttons = $('a[data-icon], button[data-icon]');
      var isMobileWidth = ($(window).width() <= 480);
      isMobileWidth ? $buttons.attr('data-iconpos', 'notext') : $buttons.removeAttr('data-iconpos');
   },
   openLinksInApp: function () {
      $(document).on('click', 'a[target=_blank]', function (event) {
         event.preventDefault();
         window.open($(this).attr('href'), '_blank');
      });
   }
};