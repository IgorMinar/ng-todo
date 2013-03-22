var app = angular.module('todo', ['ngResource']);


app.constant('apiKey', '4fc27c99e4b0401bdbfd1741');

app.factory('Item', function($resource, apiKey) {
  var Item = $resource('https://api.mongolab.com/api/1/databases/ng-todo/collections/items/:id', {
    apiKey: apiKey
  }, {
    update: {method: 'PUT'}
  });

  Item.prototype.$remove = function() {
    Item.remove({id: this._id.$oid});
  };

  Item.prototype.$update = function() {
    return Item.update({id: this._id.$oid}, angular.extend({}, this, {_id: undefined}));
  };

  Item.prototype.done = false;

  return Item;
});


app.controller('App', function($scope, Item) {

	$scope.editedItem = null;

  var items = Item.query();
  $scope.allItems = items;
  $scope.items = items;
	$scope.currScope = 'all';

  $scope.add = function() {
    var item = new Item({text: $scope.newText});
    items.push(item);
    $scope.newText = '';

    // save to mongolab
    item.$save();
  };

	$scope.startEditing = function(item){
			item.editing=true;
			$scope.editedItem = item;
	}
			
	$scope.doneEditing = function(item){
			item.editing=false;
			$scope.editedItem = null;
			item.$update();
	}

  $scope.remaining = function() {
    return items.reduce(function(count, item) {
      return item.done ? count : count + 1;
    }, 0);
  };

  $scope.showRemaining = function() {
    $scope.items = items.filter(function(item) {
      return !item.done;
    });
  };

  // event handler
  $scope.showCompleted = function() {
    $scope.items = items.filter(function(item) {
      return item.done;
    });
  };

  $scope.archive = function() {
    $scope.allItems = $scope.items = items = items.filter(function(item) {
      if (item.done) {
        item.$remove();
        return false;
      }
      return true;
    });
		if ($scope.currScope == 'done') $scope.currScope = 'all';
  };
});
