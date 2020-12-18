var STATUS = [
    {id: 0, value: 'Open' , name: 'open'},
    {id: 1, value: 'Assess' , name: 'assess'},
    {id: 2, value: 'In Progress' , name: 'inProgress'},
    {id: 3, value: 'Code Review' , name: 'codeReview'},
    {id: 4, value: 'Unit Testing' , name: 'unitTesting'},
    {id: 5, value: 'Fixed' , name: 'fixed'},
    {id: 6, value: 'Ready For QA Testing' , name: 'readyForQATesting'},
    {id: 7, value: 'Quality Assurance Testing' , name: 'qaTesting'},
    {id: 8, value: 'Quality Assurance Completed' , name: 'qaCompleted'},
    {id: 9, value: 'User Acceptance Testing' , name: 'userAcceptanceTesting'},
    {id: 10, value: 'Ready To Release' , name: 'readyToRelease'},
    {id: 11, value: 'Resolved' , name: 'resolved'},
    {id: 12, value: 'Not reproducible' , name: 'notReproducible'},
    {id: 13, value: 'Will fix later' , name: 'willFixLater'},
    {id: 14, value: 'Will not fix' , name: 'wontfix'},
    {id: 15, value: 'Invalid' , name: 'invalid'}
]

var PRIORITY = [
  {id: 80, value: '80' , name: 'High'},
  {id: 50, value: '50' , name: 'Medium'},
  {id: 25, value: '25' , name: 'Low'},
  {id: 0,  value: '0' ,  name: 'Wishlist'},
  {id: 90, value: '90' , name: 'Needs Triage'}
]

$(function() {


    var db = {
        loadData: function(filter) {
            return $.ajax({
                type: "GET",
                url: "tickets.json",
                data: filter
            }).then((data)=> {
                return data.returnData;
            });
        },

        insertItem: function(item) {
            return $.ajax({
                type: "POST",
                url: "tickets/add.json",
                data: item
            });
        },

        updateItem: function(item) {
            return $.ajax({
                type: "PUT",
                url: "tickets/edit.json",
                data: item
            });
        },

        deleteItem: function(item) {
            return $.ajax({
                type: "DELETE",
                url: "tickets/delete.json",
                data: item
            });
        }
    }
    var selectedItems = [];
 
    var selectItem = function(item) {
        selectedItems.push(item);
    };

    var selectAllItems = function(item) {
        selectedItems.push(item);
    };
 
    var unselectItem = function(item) {
        selectedItems = $.grep(selectedItems, function(i) {
            return i !== item;
        });
    };
 
    $("#all-tickets").jsGrid({
        height: "calc( 100% - 50px)",
        width: "100%",

        filtering: true,
        editing: true,
        sorting: true,
        paging: true,
        autoload: true,

        pageSize: 10,
        paging: true,
        loadIndication: true,
        pageButtonCount: 5,

        controller: db,
        rowClick: function(args) { 
            console.log("sdf", args);
        },
        fields: [
            {
                headerTemplate: function() {
                    return $("<button>").attr("type", "button").text("All")
                            .on("click", function () {
                                selectAllItems();
                            });
                },
                itemTemplate: function(_, item) {
                    return $("<input>").attr("type", "checkbox")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem(item) : unselectItem(item);
                            });
                },
                align: "center",
                editing: false,
                width: 50

            },
            { name: 'id', title: "Id", type: "text", width: 30, editing: false},
            { name: 'name', title: 'Name', type: "text", width: 150 ,sorting: false},
            {name: 'description', title: 'Ticket Description', type: "text", width: 150, sorting: false},
            { name: 'status', title: 'Status', sorter: "STATUS", type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: STATUS, valueField: "id", textField: "value" 
            },
            { name: 'priority', title: 'Priority', type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: PRIORITY, valueField: "id", textField: "name" },

            { type: "control", deleteButton: false}
        ]

    });
});

jsGrid.sortStrategies.STATUS = function(index1, index2) {
    var status1 = STATUS.findIndex(function(item){
                    return item.name == index1;
                    })
    var status2 = STATUS.findIndex(function(item){
                    return item.name == index2;
                  })
    return status1.localeCompare(status2);
};
