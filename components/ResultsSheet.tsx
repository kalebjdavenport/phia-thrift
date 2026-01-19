import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import type { IdentificationResponse } from '@/lib/schemas';
import { IconButton } from '@/components/ui/IconButton';
import { buildPhiaSearchUrl } from '@/lib/utils';

interface ResultsSheetProps {
  result: IdentificationResponse | null;
  onClose: () => void;
}

export const ResultsSheet = forwardRef<BottomSheet, ResultsSheetProps>(
  function ResultsSheet({ result, onClose }, ref) {
    const snapPoints = useMemo(() => ['50%', '85%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#d1d5db', width: 40 }}
        onChange={(index) => {
          if (index === -1) onClose();
        }}
      >
        <BottomSheetView className="flex-1 px-6">
          {!result ? null : (
            <>
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-primary">
              {result.category}
            </Text>
            <IconButton
              icon={X}
              color="#000"
              size={24}
              onPress={onClose}
            />
          </View>

          {/* Main Info */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-primary">
              {result.brand ?? result.subcategory}
            </Text>
            {result.productName && (
              <Text className="mt-1 text-base text-muted">
                {result.productName}
              </Text>
            )}
          </View>

          {/* Details Grid */}
          <View className="flex-row flex-wrap">
            <DetailItem label="Color" value={result.color} />
            <DetailItem label="Material" value={result.material ?? 'Unknown'} />
            <DetailItem label="Pattern" value={result.pattern} />
            <DetailItem label="Style" value={result.style} />
          </View>

          {/* Confidence */}
          <View className="mt-6 rounded-xl bg-gray-100 p-4">
            <Text className="mb-2 text-sm font-semibold text-primary">
              Confidence
            </Text>
            <View className="flex-row gap-4">
              <ConfidenceBadge
                label="Brand"
                level={result.confidence.brand}
              />
              <ConfidenceBadge
                label="Material"
                level={result.confidence.material}
              />
            </View>
          </View>

          {/* Reasoning */}
          <View className="mt-4">
            <Text className="text-sm text-muted">{result.reasoning}</Text>
          </View>

          {/* Search on Phia Button */}
          {result.confidence.brand !== 'none' && (
            <Pressable
              className="mt-6 mb-4 rounded-xl bg-purple-600 py-4 active:bg-purple-700"
              onPress={() => Linking.openURL(buildPhiaSearchUrl(result))}
            >
              <Text className="text-center text-lg font-semibold text-white">
                Search on Phia
              </Text>
            </Pressable>
          )}
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4 w-1/2">
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-base font-medium text-primary">{value}</Text>
    </View>
  );
}

function ConfidenceBadge({
  label,
  level,
}: {
  label: string;
  level: 'high' | 'medium' | 'low' | 'none';
}) {
  const colors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
    none: 'bg-gray-100 text-gray-800',
  };

  return (
    <View className={`rounded-full px-3 py-1 ${colors[level]}`}>
      <Text className={`text-xs font-medium ${colors[level].split(' ')[1]}`}>
        {label}: {level}
      </Text>
    </View>
  );
}
