# angular-google-feed-api
An AngularJs directive, based on Google Feed JSON interface, to load and show feeds by using your custom layout.

<br/>

```javascript

    <ng-dv-google-feed-api
            query="feedSources"
            reload-ms="60000"
            slide-ms="3000">

            <!--put here your data presentation-->
    </ng-dv-google-feed-api>

    <!--a marquee example-->
    <ng-dv-google-feed-api
            query="feedSources"
            reload-ms="180000">
        <div class="marquee-feed" >
            <marquee  behavior="scroll" direction="left" scrollamount="15" >
                {{textFeeds| uppercase}}
            </marquee>
        </div>
    </ng-dv-google-feed-api>


```
<br/>
![ScreenShot](https://raw.github.com/alchimya/angular-google-feed-api/master/screenshots/angular-google-feed-api.gif)

# How to use
<h5>isolatd scope data</h5>
  attr name   |     type        |   description    
--------------| ----------------|-------------------------------------------------------------------
query         | two-way binding | it can be  <br/>a) an array objects with this structure :<br> {<br><b>q</b>:string value with a link of rss service,<br/><b>num</b>:int to specify the number of loaded item<br/>} <br/>b) a string to perform a feed search by keywords
reloadMs      | one-way binding | Milliseconds for reloading data from the server
slideMs       | one-way binding | Milliseconds to activare a slider feeds service. Use "auto" to implement an auto calculation interval.
feedData      | two-way binding | Set here your data source  for the response body

<h5>events</h5>
  event name                        |     data        |   description    
------------------------------------| ----------------|-------------------------------------------------------------------
ngDvGoogleFeedApi_DataChanged       | custom_data     | it will be raised when your data source changes, generally if the the success promise method will be invoked.
ngDvGoogleFeedApi_FeedWillLoad      |     ***         | it will be raised before sending a request to the server.
ngDvGoogleFeedApi_FeedDidLoad       | custom_data     | it will be raised after sending a request to the server and if the the success promise method will be invoked
ngDvGoogleFeedApi_NextItem          | custom_data     | it will be raised after slideMs milliseconds.
ngDvGoogleFeedApi_FeedsDidLoad      | custom_data     | it will be raised after that all feeds are loaded

<b>custom_data</b> is an object with this structure:
<br/>
```javascript
var custom_data={
  item: feed entries array,
  totalItems: length of the feed entries array,
  currentIndex:_currentSlideIndex
};
```

Examples:
- marquee
```javascript
    <ng-dv-google-feed-api
            query="feedSources"
            reload-ms="180000">
        <div class="marquee-feed" >
            <marquee  behavior="scroll" direction="left" scrollamount="15" >
                {{textFeeds| uppercase}}
            </marquee>
        </div>
    </ng-dv-google-feed-api>
```
- post-it slide
```javascript
    <ng-dv-google-feed-api
            query="feedSources"
            reload-ms="60000"
            slide-ms="3000">

        <div class="post-it">
            <span>{{feedTitle}}</span>
            <div>
                <span>{{pageOf}}</span>
            </div>
        </div>
    </ng-dv-google-feed-api>
```

- simple data list presentation
```javascript

    <ng-dv-google-feed-api
            query="feedSources"
            reload-ms="60000"
            feed-data="feedsJSON">
            <!--data presentation-->
            <table>
                <thead>
                <tr>
                    <th>title</th>
                    <th>author</th>
                    <th>date</th>
                    <th>link</th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="item in feedsJSON">
                    <td>
                        {{item.title}}
                    </td>
                    <td>
                        {{item.author}}
                    </td>
                    <td>
                        {{item.publishedDate}}
                    </td>
                    <td>
                        <a href="{{item.link}}" target="_blank">{{item.link}}</a>
                    </td>
                </tr>
                </tbody>
            </table>

    </ng-dv-google-feed-api>


```
