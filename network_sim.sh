#!/bin/bash

# 設定網卡介面，請根據你的系統調整 (例如 eth0, ens33, wlan0)
INTERFACE="eth0"

function start_sim() {
    echo "正在對 $INTERFACE 施加網路模擬..."
    # 清除舊設定
    sudo tc qdisc del dev $INTERFACE root 2>/dev/null
    
    # 這裡可以根據需求修改參數：
    # delay: 延遲 (毫秒)
    # loss: 掉包率 (%)
    # duplicate: 重複包 (%)
    # corrupt: 損壞包 (%)
    sudo tc qdisc add dev $INTERFACE root netem delay 100ms 10ms loss 5%
    
    echo "設定完成：100ms 延遲 (+/- 10ms 抖動)，5% 掉包率。"
}

function stop_sim() {
    echo "恢復 $INTERFACE 網路正常狀態..."
    sudo tc qdisc del dev $INTERFACE root 2>/dev/null
    echo "已清除模擬設定。"
}

function status_sim() {
    tc -s qdisc show dev $INTERFACE
}

case "$1" in
    start) start_sim ;;
    stop)  stop_sim ;;
    status) status_sim ;;
    *) echo "用法: $0 {start|stop|status}" ;;
esac