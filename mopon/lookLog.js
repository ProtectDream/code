/**
 * @author zhuyue
 * @data 2016-09-18
 * @description 总部会员 -> 会员管理 -> 集团政策管理 查看同步日志dialog
 */

module.exports = function(opts) {
    //----------------require--------------
    var render = require('./lookLog.ejs');
    var parseModule = require('lib/dom/parseModule');
    var ajax = require('lib/io/ajax');
    var dialogManager = require('pages/common/dialog/frameDialogManager');
    var dialog = require('pages/common/dialog/dialog');
    var grid = require('pages/common/module/grid');
    var runtime = require("pages/common/runtime");
    var search = require('./search');
    var trim = require("lib/str/trim")

    //-----------声明模块全局变量-------------
    var dialogConfig = {
        title: opts.title || '查看同步日志',
        boxHTML: render({ data: {} }),
        buttons: [
            { 'id': 'cancel', 'text': '关闭' }
        ]
    };
    var that = dialog(dialogConfig);
    var node = that.getOuter();
    var data = null;
    var nodeList = null;
    var option = null;
    var m_grid = null;
    var m_search = null;
    var m_selectGroup = null;
    var params = { pageNumber: 1, pageSize: 50 };
    opts = opts || {};

    //-------------事件响应声明---------------
    var evtFuncs = {
        show: function(evt) {
            m_search.init();

            m_grid.init();
            custFuncs.updateGrid();
        },
        search: function(evt) {
            var cnd = evt.data.conditions;             
            custFuncs.searchGrid(cnd);
        },
        btnClick: function(evt) {
            that.hide('cancel');
        },
        page: function(e) {
            params.pageNumber = e.data.curPage;
            params.pageSize = e.data.pageSize;
            custFuncs.updateGrid();
        }
    };

    //-------------绑定事件------------------
    var bindEvents = function() {
        that.bind('show', evtFuncs.show);
        that.bind('buttonclick', evtFuncs.btnClick);
        m_search.bind('search', evtFuncs.search);
    };

    //-------------自定义函数----------------
    var custFuncs = {
        createGrid: function() {
            option = {
                columns: [
                    { display: "政策名称", name: "policyName" },
                    { display: "影院名称", name: "synchroCinameName" },
                    { display: "影院编码", name: "synchroCinemaCode" }, 
                    { display: "状态", name: "synchStatusFlag" },
                    { display: "时间", name: "synchroDate", width: 165 },
                    { display: "操作人", name: "userName" },
                    { display: "失败原因", name: "reason" }
                ],
                order: true,
                selectType: false
            };
        },
        searchGrid: function(conditions) {
            params.queryParams = conditions;
            params.pageNumber = 1;
            custFuncs.updateGrid();
        },
        updateGrid: function(conditions) {
            ajax({
                url: "/proxy/mhq/mhq/memberPolicy/syn-log-list",
                method: 'POST',
                data: { "params": JSON.stringify(params) },
                onSuccess: function(res) {
                    if (res.code == 0) {
                        m_grid.addRows(res.data.records);
                        m_grid.updatePage(res.data.totalCount, params.pageNumber);
                    } else {
                        dialogManager.alert(res.msg);
                    }
                },
                onError: function(req) {
                    console.error(runtime.getHttpErrorMessage(req));
                }
            });
        },
        sendRequest: function(url, data) {
            if(that.isLock()) return;
            that.lock();
            var defer = when.defer();
            ajax({
                url: url,
                data: data,
                method: "POST",
                onSuccess: function(res) {
                    that.unLock();
                    if (res.code == 0) {
                        defer.resolve(res);
                    } else {
                        defer.reject(res.msg);
                        dialogManager.alert(res.msg);
                    }
                },
                onError: function(req) {
                    that.unLock();
                    console.error(runtime.getHttpErrorMessage(req));
                }
            });
            return defer.promise;
        }
    };

    //-------------子模块实例化---------------
    var initMod = function() {
        m_grid = grid(nodeList.grid, option);
        m_grid.bind("page", evtFuncs.page);
        
        m_search = search(nodeList.searchBar, opts);
    };

    //-------------一切从这开始--------------
    nodeList = parseModule(node);

    custFuncs.createGrid();

    initMod();

    bindEvents();

    return that;
};