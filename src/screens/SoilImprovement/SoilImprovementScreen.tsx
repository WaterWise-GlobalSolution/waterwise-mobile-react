import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 SafeAreaView,
 ScrollView,
 TouchableOpacity,
 Alert,
 Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SoilImprovementScreenProps {
 navigation: any;
}

interface Recommendation {
 id: string;
 title: string;
 description: string;
 priority: 'high' | 'medium' | 'low';
 difficulty: 'easy' | 'medium' | 'hard';
 cost: 'low' | 'medium' | 'high';
 timeline: string;
 benefits: string[];
 steps: string[];
 icon: string;
 color: string;
 category: string;
}

interface AnalysisMetric {
 name: string;
 value: number;
 unit: string;
 status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
 description: string;
 icon: string;
 color: string;
}

const { width } = Dimensions.get('window');

const SoilImprovementScreen: React.FC<SoilImprovementScreenProps> = ({ navigation }) => {
 const { 
   produtor, 
   propriedade, 
   sensores, 
   leituras, 
   isOnline 
 } = useAuth();
 
 const insets = useSafeAreaInsets();
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
 const [analysisMetrics, setAnalysisMetrics] = useState<AnalysisMetric[]>([]);

 useEffect(() => {
   generateRecommendations();
   generateAnalysisMetrics();
 }, [propriedade]);

 const generateAnalysisMetrics = () => {
   if (!propriedade) return;

   const degradationLevel = propriedade.nivel_degradacao?.nivel_numerico || 1;
   
   // Simular dados de análise do solo baseados no nível de degradação
   const baseHealth = Math.max(20, 100 - (degradationLevel - 1) * 20);
   const variation = 10;

   const metrics: AnalysisMetric[] = [
     {
       name: 'pH do Solo',
       value: 6.0 + (Math.random() - 0.5) * 2,
       unit: '',
       status: degradationLevel <= 2 ? 'good' : degradationLevel <= 3 ? 'fair' : 'poor',
       description: 'Acidez/alcalinidade do solo',
       icon: 'flask-outline',
       color: '#2196F3',
     },
     {
       name: 'Matéria Orgânica',
       value: baseHealth + (Math.random() - 0.5) * variation,
       unit: '%',
       status: degradationLevel <= 2 ? 'excellent' : degradationLevel <= 3 ? 'good' : 'fair',
       description: 'Conteúdo de matéria orgânica',
       icon: 'leaf-outline',
       color: '#4CAF50',
     },
     {
       name: 'Capacidade de Retenção',
       value: baseHealth + (Math.random() - 0.5) * variation,
       unit: '%',
       status: degradationLevel <= 2 ? 'good' : degradationLevel <= 4 ? 'fair' : 'poor',
       description: 'Capacidade de reter água',
       icon: 'water-outline',
       color: '#00BCD4',
     },
     {
       name: 'Compactação',
       value: (degradationLevel - 1) * 20 + (Math.random() - 0.5) * 15,
       unit: '%',
       status: degradationLevel <= 2 ? 'excellent' : degradationLevel <= 3 ? 'good' : 'poor',
       description: 'Nível de compactação do solo',
       icon: 'cube-outline',
       color: '#FF9800',
     },
     {
       name: 'Erosão',
       value: (degradationLevel - 1) * 15 + (Math.random() - 0.5) * 10,
       unit: '%',
       status: degradationLevel <= 2 ? 'excellent' : degradationLevel <= 3 ? 'fair' : 'critical',
       description: 'Risco de erosão',
       icon: 'trending-down-outline',
       color: '#F44336',
     },
     {
       name: 'Fertilidade',
       value: baseHealth + (Math.random() - 0.5) * variation,
       unit: '%',
       status: degradationLevel <= 2 ? 'excellent' : degradationLevel <= 3 ? 'good' : 'fair',
       description: 'Disponibilidade de nutrientes',
       icon: 'nutrition-outline',
       color: '#9C27B0',
     },
   ];

   setAnalysisMetrics(metrics);
 };

 const generateRecommendations = () => {
   if (!propriedade?.nivel_degradacao) return;

   const degradationLevel = propriedade.nivel_degradacao.nivel_numerico;
   const allRecommendations: Recommendation[] = [];

   // Recomendações básicas para todos os níveis
   allRecommendations.push({
     id: 'soil-analysis',
     title: 'Análise Completa do Solo',
     description: 'Realize uma análise laboratorial completa para identificar deficiências específicas',
     priority: 'high',
     difficulty: 'easy',
     cost: 'low',
     timeline: '1 semana',
     benefits: [
       'Identificação precisa de nutrientes',
       'Planejamento direcionado',
       'Economia de insumos'
     ],
     steps: [
       'Colete amostras em pontos representativos',
       'Envie para laboratório certificado',
       'Analise os resultados com técnico',
       'Defina plano de correção'
     ],
     icon: 'flask-outline',
     color: '#2196F3',
     category: 'analysis'
   });

   if (degradationLevel >= 2) {
     allRecommendations.push({
       id: 'organic-matter',
       title: 'Aumento de Matéria Orgânica',
       description: 'Incorpore material orgânico para melhorar a estrutura e fertilidade do solo',
       priority: 'high',
       difficulty: 'medium',
       cost: 'medium',
       timeline: '3-6 meses',
       benefits: [
         'Melhora retenção de água',
         'Aumenta atividade biológica',
         'Fornece nutrientes gradualmente'
       ],
       steps: [
         'Aplique composto orgânico',
         'Utilize esterco curtido',
         'Plante adubos verdes',
         'Mantenha cobertura morta'
       ],
       icon: 'leaf-outline',
       color: '#4CAF50',
       category: 'organic'
     });
   }

   if (degradationLevel >= 3) {
     allRecommendations.push({
       id: 'crop-rotation',
       title: 'Rotação de Culturas',
       description: 'Implemente sistema de rotação para quebrar ciclos de pragas e doenças',
       priority: 'medium',
       difficulty: 'medium',
       cost: 'low',
       timeline: '1-2 anos',
       benefits: [
         'Reduz pragas e doenças',
         'Melhora estrutura do solo',
         'Otimiza uso de nutrientes'
       ],
       steps: [
         'Planeje sequência de culturas',
         'Inclua leguminosas fixadoras',
         'Varie famílias botânicas',
         'Monitore resultados'
       ],
       icon: 'sync-outline',
       color: '#FF9800',
       category: 'management'
     },
     {
       id: 'limestone',
       title: 'Correção da Acidez',
       description: 'Aplique calcário para corrigir pH e fornecer cálcio e magnésio',
       priority: 'high',
       difficulty: 'easy',
       cost: 'medium',
       timeline: '1-3 meses',
       benefits: [
         'Corrige pH do solo',
         'Melhora disponibilidade de nutrientes',
         'Reduz toxidez do alumínio'
       ],
       steps: [
         'Calcule necessidade de calcário',
         'Aplique uniformemente',
         'Incorpore ao solo',
         'Monitore pH após 3 meses'
       ],
       icon: 'flask-outline',
       color: '#9C27B0',
       category: 'correction'
     });
   }

   if (degradationLevel >= 4) {
     allRecommendations.push({
       id: 'contour-farming',
       title: 'Cultivo em Curvas de Nível',
       description: 'Implemente práticas conservacionistas para reduzir erosão',
       priority: 'high',
       difficulty: 'hard',
       cost: 'high',
       timeline: '6-12 meses',
       benefits: [
         'Reduz erosão drasticamente',
         'Conserva água da chuva',
         'Melhora infiltração'
       ],
       steps: [
         'Contrate topógrafo',
         'Marque curvas de nível',
         'Construa terraços se necessário',
         'Adapte sistema de plantio'
       ],
       icon: 'trending-up-outline',
       color: '#F44336',
       category: 'conservation'
     },
     {
       id: 'drainage',
       title: 'Sistema de Drenagem',
       description: 'Instale drenagem para evitar encharcamento e compactação',
       priority: 'medium',
       difficulty: 'hard',
       cost: 'high',
       timeline: '3-6 meses',
       benefits: [
         'Evita encharcamento',
         'Reduz compactação',
         'Melhora aeração do solo'
       ],
       steps: [
         'Identifique áreas problemáticas',
         'Projete sistema de drenagem',
         'Instale drenos e canais',
         'Monitore eficiência'
       ],
       icon: 'water-outline',
       color: '#00BCD4',
       category: 'infrastructure'
     });
   }

   if (degradationLevel === 5) {
     allRecommendations.push({
       id: 'deep-subsoiling',
       title: 'Subsolagem Profunda',
       description: 'Realize subsolagem para quebrar camadas compactadas críticas',
       priority: 'high',
       difficulty: 'hard',
       cost: 'high',
       timeline: '1-2 meses',
       benefits: [
         'Quebra camadas compactadas',
         'Melhora penetração de raízes',
         'Aumenta infiltração de água'
       ],
       steps: [
         'Avalie profundidade da compactação',
         'Aguarde condições ideais de umidade',
         'Execute subsolagem cruzada',
         'Evite tráfego posterior'
       ],
       icon: 'hammer-outline',
       color: '#E91E63',
       category: 'recovery'
     },
     {
       id: 'plant-cover',
       title: 'Plantas de Cobertura Intensiva',
       description: 'Use plantas específicas para recuperação de solos degradados',
       priority: 'high',
       difficulty: 'medium',
       cost: 'medium',
       timeline: '6-18 meses',
       benefits: [
         'Protege contra erosão',
         'Adiciona matéria orgânica',
         'Melhora biologia do solo'
       ],
       steps: [
         'Selecione espécies adequadas',
         'Plante em período adequado',
         'Mantenha cobertura constante',
         'Incorpore ao solo quando necessário'
       ],
       icon: 'flower-outline',
       color: '#8BC34A',
       category: 'recovery'
     });
   }

   setRecommendations(allRecommendations);
 };

 const handleBack = () => {
   navigation.goBack();
 };

 const getStatusColor = (status: string) => {
   switch (status) {
     case 'excellent': return '#4CAF50';
     case 'good': return '#8BC34A';
     case 'fair': return '#FF9800';
     case 'poor': return '#FF5722';
     case 'critical': return '#F44336';
     default: return '#888888';
   }
 };

 const getStatusText = (status: string) => {
   switch (status) {
     case 'excellent': return 'Excelente';
     case 'good': return 'Bom';
     case 'fair': return 'Regular';
     case 'poor': return 'Ruim';
     case 'critical': return 'Crítico';
     default: return 'N/A';
   }
 };

 const getPriorityColor = (priority: string) => {
   switch (priority) {
     case 'high': return '#F44336';
     case 'medium': return '#FF9800';
     case 'low': return '#4CAF50';
     default: return '#888888';
   }
 };

 const getDifficultyText = (difficulty: string) => {
   switch (difficulty) {
     case 'easy': return 'Fácil';
     case 'medium': return 'Médio';
     case 'hard': return 'Difícil';
     default: return 'N/A';
   }
 };

 const getCostText = (cost: string) => {
   switch (cost) {
     case 'low': return 'Baixo';
     case 'medium': return 'Médio';
     case 'high': return 'Alto';
     default: return 'N/A';
   }
 };

 const categories = [
   { id: 'all', label: 'Todas', count: recommendations.length },
   { id: 'analysis', label: 'Análise', count: recommendations.filter(r => r.category === 'analysis').length },
   { id: 'organic', label: 'Orgânico', count: recommendations.filter(r => r.category === 'organic').length },
   { id: 'correction', label: 'Correção', count: recommendations.filter(r => r.category === 'correction').length },
   { id: 'management', label: 'Manejo', count: recommendations.filter(r => r.category === 'management').length },
   { id: 'conservation', label: 'Conservação', count: recommendations.filter(r => r.category === 'conservation').length },
   { id: 'recovery', label: 'Recuperação', count: recommendations.filter(r => r.category === 'recovery').length },
 ];

 const filteredRecommendations = selectedCategory === 'all' 
   ? recommendations 
   : recommendations.filter(r => r.category === selectedCategory);

 const CategoryButton = ({ category }: { category: any }) => (
   <TouchableOpacity
     style={[
       styles.categoryButton,
       selectedCategory === category.id && styles.activeCategoryButton
     ]}
     onPress={() => setSelectedCategory(category.id)}
   >
     <Text style={[
       styles.categoryButtonText,
       selectedCategory === category.id && styles.activeCategoryButtonText
     ]}>
       {category.label}
     </Text>
     {category.count > 0 && (
       <View style={[
         styles.categoryBadge,
         selectedCategory === category.id && styles.activeCategoryBadge
       ]}>
         <Text style={[
           styles.categoryBadgeText,
           selectedCategory === category.id && styles.activeCategoryBadgeText
         ]}>
           {category.count}
         </Text>
       </View>
     )}
   </TouchableOpacity>
 );

 const MetricCard = ({ metric }: { metric: AnalysisMetric }) => (
   <View style={styles.metricCard}>
     <LinearGradient
       colors={['#2D2D2D', '#3D3D3D']}
       style={styles.metricCardGradient}
     >
       <View style={styles.metricCardHeader}>
         <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
           <Ionicons name={metric.icon as any} size={20} color={metric.color} />
         </View>
         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(metric.status) + '20' }]}>
           <Text style={[styles.statusBadgeText, { color: getStatusColor(metric.status) }]}>
             {getStatusText(metric.status)}
           </Text>
         </View>
       </View>
       
       <Text style={styles.metricName}>{metric.name}</Text>
       <View style={styles.metricValueContainer}>
         <Text style={[styles.metricValue, { color: metric.color }]}>
           {metric.value.toFixed(1)}
         </Text>
         <Text style={styles.metricUnit}>{metric.unit}</Text>
       </View>
       <Text style={styles.metricDescription}>{metric.description}</Text>
     </LinearGradient>
   </View>
 );

 const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => (
   <View style={styles.recommendationCard}>
     <LinearGradient
       colors={['#2D2D2D', '#3D3D3D']}
       style={styles.recommendationCardGradient}
     >
       <View style={styles.recommendationHeader}>
         <View style={[styles.recommendationIcon, { backgroundColor: recommendation.color + '20' }]}>
           <Ionicons name={recommendation.icon as any} size={24} color={recommendation.color} />
         </View>
         <View style={styles.recommendationBadges}>
           <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) + '20' }]}>
             <Text style={[styles.priorityBadgeText, { color: getPriorityColor(recommendation.priority) }]}>
               {recommendation.priority === 'high' ? 'Alta' : recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
             </Text>
           </View>
         </View>
       </View>

       <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
       <Text style={styles.recommendationDescription}>{recommendation.description}</Text>

       <View style={styles.recommendationDetails}>
         <View style={styles.detailItem}>
           <Ionicons name="time-outline" size={16} color="#CCCCCC" />
           <Text style={styles.detailText}>{recommendation.timeline}</Text>
         </View>
         <View style={styles.detailItem}>
           <Ionicons name="build-outline" size={16} color="#CCCCCC" />
           <Text style={styles.detailText}>{getDifficultyText(recommendation.difficulty)}</Text>
         </View>
         <View style={styles.detailItem}>
           <Ionicons name="cash-outline" size={16} color="#CCCCCC" />
           <Text style={styles.detailText}>Custo {getCostText(recommendation.cost)}</Text>
         </View>
       </View>

       <View style={styles.benefitsSection}>
         <Text style={styles.benefitsTitle}>Benefícios:</Text>
         {recommendation.benefits.slice(0, 2).map((benefit, index) => (
           <View key={index} style={styles.benefitItem}>
             <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
             <Text style={styles.benefitText}>{benefit}</Text>
           </View>
         ))}
       </View>

       <TouchableOpacity
         style={styles.viewDetailsButton}
         onPress={() => {
           Alert.alert(
             recommendation.title,
             `${recommendation.description}\n\nPassos para implementação:\n${recommendation.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`,
             [{ text: 'OK' }]
           );
         }}
       >
         <Text style={styles.viewDetailsButtonText}>Ver Detalhes</Text>
         <Ionicons name="chevron-forward" size={16} color="#00FFCC" />
       </TouchableOpacity>
     </LinearGradient>
   </View>
 );

 const SoilHealthSummary = () => {
   if (!propriedade?.nivel_degradacao) return null;

   const level = propriedade.nivel_degradacao.nivel_numerico;
   const healthScore = Math.max(20, 100 - (level - 1) * 20);
   const healthColor = level <= 2 ? '#4CAF50' : level <= 3 ? '#FF9800' : '#F44336';

   return (
     <View style={styles.summaryCard}>
       <LinearGradient
         colors={['#2D2D2D', '#3D3D3D']}
         style={styles.summaryCardGradient}
       >
         <View style={styles.summaryHeader}>
           <Text style={styles.summaryTitle}>Resumo da Saúde do Solo</Text>
           <View style={[styles.healthScore, { backgroundColor: healthColor + '20' }]}>
             <Text style={[styles.healthScoreText, { color: healthColor }]}>
               {healthScore.toFixed(0)}%
             </Text>
           </View>
         </View>

         <Text style={styles.summaryDescription}>
           {propriedade.nivel_degradacao.descricao_degradacao}
         </Text>

         <View style={styles.summaryActions}>
           <Text style={styles.summaryActionsTitle}>Ações Recomendadas:</Text>
           <Text style={styles.summaryActionsText}>
             {propriedade.nivel_degradacao.acoes_corretivas}
           </Text>
         </View>

         <View style={styles.summaryStats}>
           <View style={styles.summaryStatItem}>
             <Text style={styles.summaryStatValue}>{filteredRecommendations.length}</Text>
             <Text style={styles.summaryStatLabel}>Recomendações</Text>
           </View>
           <View style={styles.summaryStatItem}>
             <Text style={styles.summaryStatValue}>
               {filteredRecommendations.filter(r => r.priority === 'high').length}
             </Text>
             <Text style={styles.summaryStatLabel}>Alta Prioridade</Text>
           </View>
           <View style={styles.summaryStatItem}>
             <Text style={styles.summaryStatValue}>{propriedade.area_hectares.toFixed(1)}</Text>
             <Text style={styles.summaryStatLabel}>Hectares</Text>
           </View>
         </View>
       </LinearGradient>
     </View>
   );
 };

 return (
   <View style={[styles.container, { paddingTop: insets.top }]}>
     <LinearGradient
       colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
       style={styles.gradient}
     >
       {/* Header */}
       <View style={styles.header}>
         <TouchableOpacity onPress={handleBack} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Melhoramento do Solo</Text>
         <TouchableOpacity 
           onPress={() => {
             if (!isOnline) {
               Alert.alert('Modo Offline', 'Consulta a especialistas não disponível offline.');
               return;
             }
             Alert.alert('Em Desenvolvimento', 'Consulta a especialistas estará disponível em breve.');
           }}
           style={styles.expertButton}
         >
           <Ionicons name="people-outline" size={24} color="#00FFCC" />
         </TouchableOpacity>
       </View>

       {/* Offline Notice */}
       {!isOnline && (
         <View style={styles.offlineNotice}>
           <Ionicons name="cloud-offline-outline" size={16} color="#FF9800" />
           <Text style={styles.offlineNoticeText}>
             Dados offline • Algumas funcionalidades limitadas
           </Text>
         </View>
       )}

       <ScrollView
         contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
       >
         {/* Property Info */}
         <View style={styles.section}>
           <View style={styles.propertyInfo}>
             <Text style={styles.propertyName}>{propriedade?.nome_propriedade}</Text>
             <Text style={styles.propertyDetails}>
               Nível de degradação: {propriedade?.nivel_degradacao?.codigo_degradacao || 'N/A'}
             </Text>
           </View>
         </View>

         {/* Soil Health Summary */}
         <View style={styles.section}>
           <SoilHealthSummary />
         </View>

         {/* Analysis Metrics */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Análise do Solo</Text>
           <ScrollView
             horizontal
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.metricsContainer}
           >
             {analysisMetrics.map((metric, index) => (
               <MetricCard key={index} metric={metric} />
             ))}
           </ScrollView>
         </View>

         {/* Categories */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Categorias</Text>
           <ScrollView
             horizontal
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.categoriesContainer}
           >
             {categories.map((category) => (
               <CategoryButton key={category.id} category={category} />
             ))}
           </ScrollView>
         </View>

         {/* Recommendations */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>
             Recomendações {selectedCategory !== 'all' && `(${filteredRecommendations.length})`}
           </Text>
           
           {filteredRecommendations.length === 0 ? (
             <View style={styles.emptyState}>
               <Ionicons name="leaf-outline" size={48} color="#CCCCCC" />
               <Text style={styles.emptyStateText}>
                 Nenhuma recomendação encontrada para esta categoria
               </Text>
             </View>
           ) : (
             <View style={styles.recommendationsList}>
               {filteredRecommendations.map((recommendation) => (
                 <RecommendationCard key={recommendation.id} recommendation={recommendation} />
               ))}
             </View>
           )}
         </View>

         <View style={styles.bottomPadding} />
       </ScrollView>
     </LinearGradient>
   </View>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#1A1A1A',
 },
 gradient: {
   flex: 1,
 },
 header: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   paddingHorizontal: 20,
   paddingTop: 20,
   paddingBottom: 20,
 },
 backButton: {
   padding: 8,
 },
 headerTitle: {
   color: '#FFFFFF',
   fontSize: 18,
   fontWeight: '600',
 },
 expertButton: {
   padding: 8,
 },
 offlineNotice: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   paddingVertical: 8,
   paddingHorizontal: 16,
   backgroundColor: 'rgba(255, 152, 0, 0.1)',
   marginHorizontal: 20,
   borderRadius: 8,
   marginBottom: 16,
 },
 offlineNoticeText: {
   color: '#FF9800',
   fontSize: 12,
   marginLeft: 8,
 },
 scrollContent: {
   paddingHorizontal: 20,
   paddingBottom: 40,
 },
 section: {
   marginBottom: 24,
 },
 sectionTitle: {
   color: '#FFFFFF',
   fontSize: 18,
   fontWeight: '600',
   marginBottom: 16,
 },
 propertyInfo: {
   alignItems: 'center',
   marginBottom: 8,
 },
 propertyName: {
   color: '#FFFFFF',
   fontSize: 20,
   fontWeight: '700',
   marginBottom: 4,
 },
 propertyDetails: {
   color: '#CCCCCC',
   fontSize: 14,
 },
 summaryCard: {
   borderRadius: 12,
   overflow: 'hidden',
 },
 summaryCardGradient: {
   padding: 16,
   borderWidth: 1,
   borderColor: '#3D3D3D',
   borderRadius: 12,
 },
 summaryHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 12,
 },
 summaryTitle: {
   color: '#FFFFFF',
   fontSize: 16,
   fontWeight: '600',
 },
 healthScore: {
   paddingHorizontal: 12,
   paddingVertical: 6,
   borderRadius: 16,
 },
 healthScoreText: {
   fontSize: 14,
   fontWeight: '700',
 },
 summaryDescription: {
   color: '#CCCCCC',
   fontSize: 14,
   marginBottom: 16,
   lineHeight: 20,
 },
 summaryActions: {
   marginBottom: 16,
 },
 summaryActionsTitle: {
   color: '#FFFFFF',
   fontSize: 14,
   fontWeight: '600',
   marginBottom: 8,
 },
 summaryActionsText: {
   color: '#CCCCCC',
   fontSize: 12,
   lineHeight: 18,
 },
 summaryStats: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   borderTopWidth: 1,
   borderTopColor: '#3D3D3D',
   paddingTop: 16,
 },
summaryStatItem: {
   alignItems: 'center',
 },
 summaryStatValue: {
   color: '#00FFCC',
   fontSize: 20,
   fontWeight: '700',
   marginBottom: 4,
 },
 summaryStatLabel: {
   color: '#CCCCCC',
   fontSize: 12,
 },
 metricsContainer: {
   paddingRight: 20,
 },
 metricCard: {
   width: 140,
   marginRight: 12,
   borderRadius: 12,
   overflow: 'hidden',
 },
 metricCardGradient: {
   padding: 12,
   borderWidth: 1,
   borderColor: '#3D3D3D',
   borderRadius: 12,
 },
 metricCardHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 8,
 },
 metricIcon: {
   width: 32,
   height: 32,
   borderRadius: 16,
   alignItems: 'center',
   justifyContent: 'center',
 },
 statusBadge: {
   paddingHorizontal: 6,
   paddingVertical: 2,
   borderRadius: 8,
 },
 statusBadgeText: {
   fontSize: 10,
   fontWeight: '600',
 },
 metricName: {
   color: '#FFFFFF',
   fontSize: 12,
   fontWeight: '600',
   marginBottom: 4,
 },
 metricValueContainer: {
   flexDirection: 'row',
   alignItems: 'baseline',
   marginBottom: 4,
 },
 metricValue: {
   fontSize: 18,
   fontWeight: '700',
 },
 metricUnit: {
   color: '#CCCCCC',
   fontSize: 12,
   marginLeft: 2,
 },
 metricDescription: {
   color: '#CCCCCC',
   fontSize: 10,
   lineHeight: 14,
 },
 categoriesContainer: {
   paddingRight: 20,
 },
 categoryButton: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 12,
   paddingVertical: 8,
   backgroundColor: '#2D2D2D',
   borderRadius: 20,
   borderWidth: 1,
   borderColor: '#3D3D3D',
   marginRight: 8,
 },
 activeCategoryButton: {
   backgroundColor: 'rgba(0, 255, 204, 0.1)',
   borderColor: '#00FFCC',
 },
 categoryButtonText: {
   color: '#CCCCCC',
   fontSize: 12,
   fontWeight: '500',
 },
 activeCategoryButtonText: {
   color: '#00FFCC',
 },
 categoryBadge: {
   backgroundColor: '#3D3D3D',
   paddingHorizontal: 6,
   paddingVertical: 2,
   borderRadius: 10,
   marginLeft: 6,
 },
 activeCategoryBadge: {
   backgroundColor: '#00FFCC',
 },
 categoryBadgeText: {
   color: '#CCCCCC',
   fontSize: 10,
   fontWeight: '600',
 },
 activeCategoryBadgeText: {
   color: '#1A1A1A',
 },
 recommendationsList: {
   gap: 16,
 },
 recommendationCard: {
   borderRadius: 12,
   overflow: 'hidden',
 },
 recommendationCardGradient: {
   padding: 16,
   borderWidth: 1,
   borderColor: '#3D3D3D',
   borderRadius: 12,
 },
 recommendationHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 12,
 },
 recommendationIcon: {
   width: 48,
   height: 48,
   borderRadius: 24,
   alignItems: 'center',
   justifyContent: 'center',
 },
 recommendationBadges: {
   flexDirection: 'row',
   gap: 8,
 },
 priorityBadge: {
   paddingHorizontal: 8,
   paddingVertical: 4,
   borderRadius: 12,
 },
 priorityBadgeText: {
   fontSize: 10,
   fontWeight: '600',
   textTransform: 'uppercase',
 },
 recommendationTitle: {
   color: '#FFFFFF',
   fontSize: 16,
   fontWeight: '600',
   marginBottom: 8,
 },
 recommendationDescription: {
   color: '#CCCCCC',
   fontSize: 14,
   lineHeight: 20,
   marginBottom: 16,
 },
 recommendationDetails: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 16,
   paddingVertical: 12,
   borderTopWidth: 1,
   borderBottomWidth: 1,
   borderColor: '#3D3D3D',
 },
 detailItem: {
   flexDirection: 'row',
   alignItems: 'center',
   flex: 1,
 },
 detailText: {
   color: '#CCCCCC',
   fontSize: 11,
   marginLeft: 4,
 },
 benefitsSection: {
   marginBottom: 16,
 },
 benefitsTitle: {
   color: '#FFFFFF',
   fontSize: 14,
   fontWeight: '600',
   marginBottom: 8,
 },
 benefitItem: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 4,
 },
 benefitText: {
   color: '#CCCCCC',
   fontSize: 12,
   marginLeft: 8,
   flex: 1,
 },
 viewDetailsButton: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   paddingVertical: 12,
   backgroundColor: 'rgba(0, 255, 204, 0.1)',
   borderRadius: 8,
   borderWidth: 1,
   borderColor: 'rgba(0, 255, 204, 0.3)',
 },
 viewDetailsButtonText: {
   color: '#00FFCC',
   fontSize: 14,
   fontWeight: '600',
   marginRight: 4,
 },
 emptyState: {
   alignItems: 'center',
   paddingVertical: 40,
 },
 emptyStateText: {
   color: '#CCCCCC',
   fontSize: 14,
   marginTop: 16,
   textAlign: 'center',
 },
 bottomPadding: {
   height: 40,
 },
});

export default SoilImprovementScreen;