/**
 * Created by domenicovacchiano on 19/05/15.
 */
/**
 * @name        ngDvGoogleFeedApi
 * @restrict    E
 * @description
 * Allows to load and show feeds by using Google Feed JSON interface
 * @references
 * https://developers.google.com/feed/v1/jsondevguide?csw=1
 * @isolated_scope
 * ------------------------------------------------------------------------------------------------------
 * attr name        type                description
 * ------------------------------------------------------------------------------------------------------
 * query            two-way binding     it can be
 *                                      a) an array objects with this structure :
 *                                          {
 *                                              q:string value with a link of rss service
 *                                              num:int to specify the number of loaded item
 *                                          }
 *                                      b) a string to perform a feed search by keywords
 * reloadMs         one-way binding     Milliseconds for reloading data from the server
 * slideMs          one-way binding     Milliseconds to activare a slider feeds service.
 *                                      Use "auto" to implement an auto calculation interval
 * feedData         two-way binding     Set here your data source  for the response body
 * ------------------------------------------------------------------------------------------------------
 * @events
 * ------------------------------------------------------------------------------------------------------
 * name                                         data               description
 * ------------------------------------------------------------------------------------------------------
 * ngDvGoogleFeedApi_DataChanged              --           it will be raised when your data source changes, generally
 *                                                         if the the success promise method will be invoked
 * ngDvGoogleFeedApi_FeedWillLoad             --           it will be raised before sending a request to the server
 * ngDvGoogleFeedApi_FeedDidLoad              --           it will be raised after sending a request to the server
 *                                                         and if the the success promise method will be invoked
 * ngDvGoogleFeedApi_NextItem                 --           it will be raised after slideMs milliseconds
 * ngDvGoogleFeedApi_FeedsDidLoad             --           it will be raised after that all feeds are loaded
 * ------------------------------------------------------------------------------------------------------

 *  -------------------------------------------------------------
 *  Events implementation
 *  -------------------------------------------------------------
 *   $scope.$on('ngDvGoogleFeedApi_NextItem',function(event,data){
 *       //your code
 *       //data is an object with this structure:
 *         var data={
 *              item: feed entries array,
 *              totalItems: length of the feed entries array,
 *              currentIndex:_currentSlideIndex
 *           };
 *   });
 *   $scope.$on('ngDvGoogleFeedApi_DataChanged',function(event,data){
 *       //your code
 *       //data is an object with this structure:
 *         var data={
 *              item: feed entries array,
 *              totalItems: length of the feed entries array,
 *              currentIndex:_currentSlideIndex
 *           };
 *   });
 *   $scope.$on('ngDvGoogleFeedApi_FeedWillLoad',function(event){
 *       //your code
 *       //data is an object with this structure:
 *         var data={
 *              item: feed entries array,
 *              totalItems: length of the feed entries array,
 *              currentIndex:_currentSlideIndex
 *           };
 *   });
 *   $scope.$on('ngDvGoogleFeedApi_FeedDidLoad',function(event,data){
 *       //your code
 *       //data is an object with this structure:
 *         var data={
 *              item: feed entries array,
 *              totalItems: length of the feed entries array,
 *              currentIndex:_currentSlideIndex
 *           };
 *   });
 *   $scope.$on('ngDvGoogleFeedApi_FeedsDidLoad',function(event,data){
 *       //your code
 *       //data is an object with this structure:
 *         var data={
 *              item: feed entries array,
 *              totalItems: length of the feed entries array,
 *              currentIndex:_currentSlideIndex
 *           };
 *   });
 *  -------------------------------------------------------------
 * @example
 *  <ng-dv-google-feed-api
 *       query="feedSources"
 *       reload-ms="180000">
 *       <div class="marquee-feed" >
 *           <marquee  behavior="scroll" direction="left" scrollamount="15" >
 *               {{textFeeds| uppercase}}
 *           </marquee>
 *       </div>
 *   </ng-dv-google-feed-api>
 *  -------------------------------------------------------------
 *  For the previous example I used the controller below
 *  -------------------------------------------------------------
 *  var googleFeedApiController=angular.module('myApp.GoogleFeedApiController',[]);
 *  googleFeedApiController.controller('GoogleFeedApiController',function($scope,$timeout){
 *      $scope.feedSources=[
 *          {q:"http://rss.cnn.com/rss/cnn_topstories.rss",num:10},
 *          {q:"http://www.cbn.com/cbnnews/world/feed/",num:10},
 *          {q:"http://news.yahoo.com/rss/",num:10}
 *      ];
 *      $scope.$on('ngDvGoogleFeedApi_FeedsDidLoad',function(event,data){
 *          $scope.textFeeds="";
 *          for (var i=0;i<data.length;i++){
 *              $scope.textFeeds=$scope.textFeeds + data[i].title + ' - ' ;
 *          }
 *      });
 *   });
 *  -------------------------------------------------------------
 */


var ngDvGoogleFeedApiModule=angular.module('ngDvGoogleFeedApiModule',[]);
ngDvGoogleFeedApiModule.directive('ngDvGoogleFeedApi',function($http,$q,$compile,$interval){

    return{
        restrict:'E',
        replace: false,
        scope:{
            query:'=',
            reloadMs:'@',
            slideMs:'@',
            feedData:'='
        },

        link: function(scope,element,attrs,ctrl){

            var _timerReload;
            var _timerSlide;
            var _currentSlideIndex=0;
            var _isAutoTimerSlide=false;
            var _feedSources=[];
            var _feedEntries=[];

            //api command values (see Google documentation on https://developers.google.com/feed/v1/jsondevguide?csw=1)
            // 0: Load Feed - https://ajax.googleapis.com/ajax/services/feed/load
            // 1: Find Feed - https://ajax.googleapis.com/ajax/services/feed/find
            var _apiCommand=0;

            //scope params controls
            if (scope.query===undefined){
                throw new Error("Invalid query attribute");
            }

            //sets api command type (see above at _apiCommand var definition)
            console.log(scope.query);
            if (angular.isString(scope.query)){
                _apiCommand=1;
                _feedSources.push({q:scope.query})
            }else{
                _feedSources=angular.copy(scope.query);
            }
            /*
            //TODO
            _apiCommand=0;
            _feedSources=angular.copy(scope.query);
            */

            //sets reload time
            scope._reloadMs=parseInt(scope.reloadMs) ? scope.reloadMs : 0;

            //sets slide time
            if (angular.uppercase(scope.slideMs)==="AUTO"){
                _isAutoTimerSlide=true;
            }else{
                scope._slideMs=parseInt(scope.slideMs) ? scope.slideMs : 0;
            }

            if (element.html().trim().length != 0) {
                element.append($compile(element.contents())(scope));
            }

            var getAPIUrl=function(index){
                //see https://developers.google.com/feed/v1/jsondevguide?csw=1 for details
                //builds api url feed or load

                if (_apiCommand==0){
                    //load
                    return "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q="
                        + _feedSources[index].q + "&num="
                        + _feedSources[index].num
                        + "&callback=JSON_CALLBACK";

                } else if (_apiCommand==1){
                    //find
                    return "https://ajax.googleapis.com/ajax/services/feed/find?v=1.0&q="
                        + _feedSources[index].q
                        + "&callback=JSON_CALLBACK";
                }
            };

            var getFeedEntries=function(data){

                //- find service will respond with this JSON structure:
                //
                //  JSON
                //      responseData:
                //              entries:[]
                //
                //- load service will respond with this JSON structure:
                //
                //  JSON
                //      responseData:
                //              feed:
                //                  entries:[]
                //

                if (_apiCommand==0){
                    //load
                    return data.responseData.feed.entries;
                } else if (_apiCommand==1){
                    //find
                    return data.responseData.entries;
                }
            };

            var setSlideService=function(){

                if (_feedSources.length==0){
                    return;
                }
                //Calculates slide timer with number of feed entries and reload time.
                //For example if we have 20 feed entries and a reload time of 60000 ms
                //we will show an entry each 3000 ms (3sec) so after 60sec we will show
                //all 20 entries ;-)
                if (_isAutoTimerSlide && scope._reloadMs>0){
                    scope._slideMs=parseInt(scope._reloadMs/_feedEntries.length);
                }
                //starts a slider service for a timed emit
                if (scope._slideMs>0){
                    $interval.cancel(_timerSlide);
                    sliderFunc()
                    _timerSlide = $interval(sliderFunc, scope._slideMs);
                }
            };

            var sliderFunc=function(){

                if (_feedEntries.length==0){
                    return;
                }
                //sets current index to get the item to send on the next item event
                _currentSlideIndex<_feedEntries.length-1?_currentSlideIndex++:_currentSlideIndex=0;

                //makes a new object to send on the event
                var nextItem={
                    item:_feedEntries[_currentSlideIndex],
                    totalItems:_feedEntries.length,
                    currentIndex:_currentSlideIndex
                };
                //event emit
                scope.$emit("ngDvGoogleFeedApi_NextItem",nextItem);
            };

            function reloadFunc() {
                var counter=0;
                //resets current index var
                _currentSlideIndex=0;
                //resets stored items
                _feedEntries=[];
                
                //send a get request to the remote Google server

                for (var i=0;i<_feedSources.length;i++){
                    //event emit
                    scope.$emit("ngDvGoogleFeedApi_FeedWillLoad");

                    $http({
                        method: "JSONP",
                        url:getAPIUrl(i),
                        headers:{'Content-Type':'application/json; charset=utf-8'}
                    })
                        .success(function (data, status, headers, config) {
                            counter++;
                            _feedEntries=_feedEntries.concat(getFeedEntries(data));
                            //sets loaded data to the two-way data binding param
                            if (scope.feedData){
                                scope.feedData=_feedEntries;
                            }
                            //event emit
                            scope.$emit("ngDvGoogleFeedApi_FeedDidLoad",_feedEntries);

                            if (counter==_feedSources.length){
                                //event emit
                                scope.$emit("ngDvGoogleFeedApi_FeedsDidLoad",_feedEntries);
                            }
                        })
                        .error(function (data, status, headers, config) {
                            throw new Error(data.message + " " + status);
                        });
                }
                //end of loop
                if (_feedSources.length>0){
                    //sets slide service
                    setSlideService();
                }
            }


            if (scope._reloadMs==0){
                reloadFunc();
            }else{
                //starts an auto reloading service by using _reloadMs time
                reloadFunc();
                _timerReload = $interval(reloadFunc, scope._reloadMs);
            }

            scope.$watch("feedData",function(newValue,oldValue){
                //watch on the instagramData attribute
                if (newValue==oldValue){
                    return;
                }
                //event emit
                scope.$emit("ngDvGoogleFeedApi_DataChanged",newValue);
            });

            element.on('$destroy', function() {
                $interval.cancel(_timerReload);
                $interval.cancel(_timerSlide);
            });

        }

    };

});
