var app = angular.module('SearchApp',[]);
app.controller('SearchCtrl',['$scope','$http', SearchCtrl]);

function SearchCtrl($scope, $http){
  var obj = {};
  $http.get('html/sample.md').success(function(data){
    str = data+'';
    var hash_arr = ['\n# ','\n## ','\n### '];
    
    var hash_obj = [{
      title:'sample',
      child:[]
    }];
    hash_inside_arr  = create_arr(0, str, '#');
    
    console.log(JSON.stringify(hash_obj));

    function create_arr(index, md_data, parent_link){
      var hash_inside_arr = [];
      var char_in = hash_arr[index];
      var get_hash_index = get_index(char_in, md_data);
      var data_length = md_data.length;
      
      for(var i=0; i< get_hash_index.length; i++){
        var current_index = get_hash_index[i];
        var last_index = i == get_hash_index.length-1 ? data_length:get_hash_index[i+1];
        var content = md_data.substring(current_index+char_in.length, last_index);
        var title_end = content.indexOf('\n');
        var title = content.substring(0, title_end);

        var obj = {};
        obj.title = title;
        obj.link = parent_link+'-'+title.replace(/ /g,'-');
        //hash_inside_arr.push(obj);
        hash_obj[0].child.push(obj);

        if(index < 3){
          var next_inside_index = md_data.indexOf(hash_arr[index+1]);
          if(next_inside_index != -1){
            obj.content = md_data.substring(current_index, next_inside_index);
            var hash_in_arr =create_arr(index+1, content, obj.link);
            if(hash_in_arr.length){
              //obj.child = hash_in_arr;
              hash_obj.child.push(obj);
            }
          }
          else{
            obj.content = content; 
          } 
        }
        else{
          obj.content = content; 
        }
      };
      return hash_inside_arr;
    }

    function get_index(char, md_data){      
      var reg_char = new RegExp(char,"g");
      var hash_index_arr = [];
      while ((match = reg_char.exec(md_data)) != null) {
          hash_index_arr.push(match.index);
      }
      return hash_index_arr;
    }

  });
}