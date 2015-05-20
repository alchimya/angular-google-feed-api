/**
 * Created by domenicovacchiano on 19/05/15.
 */


var googleFeedApiController=angular.module('myApp.GoogleFeedApiController',[]);
googleFeedApiController.controller('GoogleFeedApiController',function($scope,$timeout){


    $scope.feedsJSON={};
    $scope.searchFeed="football";
    $scope.feedsJSONSearch={};
    $scope.isRequestInProgress=true;
    $scope.lastLoadDate=new Date().toTimeString();
    $scope.feedSources=[
        {q:"http://rss.cnn.com/rss/cnn_topstories.rss",num:10},
        {q:"http://www.cbn.com/cbnnews/world/feed/",num:10},
        {q:"http://news.yahoo.com/rss/",num:10}
    ];



    //////////////////////////////////////////////////////////////////////
    //ngDvGoogleFeedApi events
    $scope.$on('ngDvGoogleFeedApi_NextItem',function(event,data){
        //console.log(data.item);
        $scope.feedTitle=data.item.title;
        $scope.pageOf=data.currentIndex + "/" + data.totalItems;
    });
    $scope.$on('ngDvGoogleFeedApi_DataChanged',function(event,data){
        $scope.isRequestInProgress=false;
    });
    $scope.$on('ngDvGoogleFeedApi_FeedWillLoad',function(event){
        $scope.isRequestInProgress=true;
    });
    $scope.$on('ngDvGoogleFeedApi_FeedDidLoad',function(event,data){
        $scope.isRequestInProgress=false;
        $scope.lastLoadDate=new Date().toTimeString();
       // console.log(data);
    });
    $scope.$on('ngDvGoogleFeedApi_FeedsDidLoad',function(event,data){
        $scope.isRequestInProgress=false;
        $scope.lastLoadDate=new Date().toTimeString();

        $scope.textFeeds="";
        for (var i=0;i<data.length;i++){
            $scope.textFeeds=$scope.textFeeds + data[i].title + ' - ' ;
        }
    });
    //////////////////////////////////////////////////////////////////////

});
